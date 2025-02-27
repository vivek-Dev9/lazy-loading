import React, { useState, useEffect, useRef } from "react";
import { AutoSizer, List } from "react-virtualized";

const COLUMN_COUNT = 50;
const COLUMN_WIDTH = 200;
const DB_NAME = "LargeTableDB";
const STORE_NAME = "rows";
let db;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToDB = async (rows) => {
  if (!db) db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    rows.forEach((row) => store.put(row));
    transaction.oncomplete = () => resolve();
  });
};

const fetchFromDB = async (start, limit) => {
  if (!db) db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    let results = [];
    let index = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && index < start + limit) {
        if (index >= start) results.push(cursor.value);
        index++;
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
};

const generateBatchData = (start, count) => {
  return Array.from({ length: count }, (_, i) => {
    const row = { id: start + i + 1 };
    for (let j = 1; j <= COLUMN_COUNT; j++) {
      row[`col${j}`] = `Row ${start + i + 1} - Col ${j}`;
    }
    return row;
  });
};

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    indexedDB.deleteDatabase(DB_NAME);
    openDB().then(() => {
      const initialData = generateBatchData(0, 1000);
      saveToDB(initialData).then(() => {
        console.log("Initial data saved to IndexedDB");
        setRecordCount(1000);
        loadData(0, 1000);
      });
    });
  }, []);

  const loadData = async (start, count) => {
    const rows = await fetchFromDB(start, count);
    setData((prev) => [...prev, ...rows]);
    if (rows.length < count) setHasMore(false);
  };

  const addMoreData = async () => {
    const newBatch = generateBatchData(recordCount, 100000);
    await saveToDB(newBatch);
    const newRecordCount = recordCount + 100000;
    setRecordCount(newRecordCount);
    loadData(recordCount, 100000);
  };

  const rowRenderer = ({ index, key, style }) => {
    const row = data[index];
    if (!row)
      return (
        <div key={key} style={style}>
          Loading...
        </div>
      );

    return (
      <div
        key={key}
        style={{
          ...style,
          display: "flex",
          borderBottom: "1px solid #ddd",
          minWidth: `${COLUMN_COUNT * COLUMN_WIDTH}px`,
        }}
      >
        {Object.values(row).map((value, i) => (
          <div
            key={i}
            style={{
              width: COLUMN_WIDTH,
              padding: "5px",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </div>
        ))}
      </div>
    );
  };

  // Sync horizontal scrolling between header and table body
  const syncScroll = () => {
    if (scrollContainerRef.current && headerRef.current) {
      headerRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ padding: "20px", width: "100vw", overflow: "hidden" }}>
      <h3>Total Records: {recordCount.toLocaleString()}</h3>
      <button
        onClick={addMoreData}
        disabled={!hasMore}
        style={{
          marginBottom: "10px",
          padding: "10px",
          cursor: hasMore ? "pointer" : "not-allowed",
        }}
      >
        {hasMore ? "Add 10,000 More Rows" : "No More Data"}
      </button>

      {/* Fixed Header with Synced Horizontal Scroll */}
      <div
        style={{
          height: "80vh",
          width: "100vw",
          border: "1px solid #ddd",
          overflow: "hidden",
        }}
      >
        <div ref={headerRef} style={{ width: "100%", overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              background: "#007bff",
              color: "#fff",
              padding: "10px",
              fontWeight: "bold",
              minWidth: `${COLUMN_COUNT * COLUMN_WIDTH}px`,
            }}
          >
            {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
              <div key={i} style={{ width: COLUMN_WIDTH, padding: "5px" }}>
                Column {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Table (Syncs with Header) */}
        <div
          ref={scrollContainerRef}
          style={{
            height: "calc(80vh - 40px)",
            width: "100%",
            overflow: "auto",
          }}
          onScroll={syncScroll}
        >
          <div style={{ minWidth: `${COLUMN_COUNT * COLUMN_WIDTH}px` }}>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  height={window.innerHeight * 0.8 - 40}
                  rowCount={data.length}
                  rowHeight={30}
                  width={width}
                  rowRenderer={rowRenderer}
                  overscanRowCount={50}
                />
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
