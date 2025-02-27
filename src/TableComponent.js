import React, { useState, useEffect, useRef } from "react";
import { AutoSizer, List } from "react-virtualized";
import ColumnSelector from "./ColumnSelector";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const COLUMNS = [
  { header: "ID", accessorKey: "id" },
  { header: "Title", accessorKey: "title" },
  { header: "Body", accessorKey: "body" },
  { header: "User ID", accessorKey: "userId" },
];

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(
    COLUMNS.map((col) => col.accessorKey)
  );
  const [loading, setLoading] = useState(false);
  const workerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("./worker.js", import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { action, data } = event.data;
      if (action === "processedData") {
        setData((prev) => [...prev, ...data]);
        setLoading(false);
      }
    };

    // Fetch first 30 rows
    fetchData(30);

    return () => workerRef.current.terminate();
  }, []);

  const fetchData = (count) => {
    if (loading) return;
    setLoading(true);

    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        workerRef.current.postMessage({
          action: "processData",
          data: data.slice(0, count),
        });
      })
      .catch((error) => console.error("API Fetch Error:", error));
  };

  const onScroll = ({ stopIndex }) => {
    if (stopIndex >= data.length - 5 && !loading) {
      fetchData(10);
    }
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
          minWidth: "100%",
        }}
      >
        {selectedColumns.map((col, i) => (
          <div
            key={i}
            style={{
              width: 200,
              padding: "5px",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {row[col]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", width: "100vw", overflow: "hidden" }}>
      <h3>Total Records: {data.length}</h3>
      <ColumnSelector
        columns={COLUMNS}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />

      <div
        style={{
          height: "80vh",
          width: "100vw",
          border: "1px solid #ddd",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#007bff",
            color: "#fff",
            padding: "10px",
            fontWeight: "bold",
          }}
        >
          {selectedColumns.map((col, i) => (
            <div key={i} style={{ width: 200, padding: "5px" }}>
              {COLUMNS.find((c) => c.accessorKey === col)?.header}
            </div>
          ))}
        </div>

        <div
          style={{
            height: "calc(80vh - 40px)",
            width: "100%",
            overflow: "auto",
          }}
        >
          <div style={{ minWidth: "100%" }}>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  ref={listRef}
                  height={window.innerHeight * 0.8 - 40}
                  rowCount={data.length}
                  rowHeight={30}
                  width={width}
                  rowRenderer={rowRenderer}
                  overscanRowCount={10}
                  onRowsRendered={onScroll}
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
