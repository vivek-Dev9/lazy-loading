import React, { useState, useEffect, useRef } from "react";
import { AutoSizer, Grid } from "react-virtualized";

// Define columns including Index column
const allColumns = [
  { accessorKey: "index", header: "#", width: 60, isIndex: true }, // Index column
  { accessorKey: "id", header: "ID", width: 100 },
  { accessorKey: "title", header: "Title", width: 300 },
  { accessorKey: "body", header: "Body", width: 500 },
];

const fetchData = async (start = 0, limit = 10) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_start=${start}&_limit=${limit}`
  );
  return response.json();
};

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const gridRef = useRef(null);
  const totalRecords = 100; // JSONPlaceholder has only 100 posts
  const rowHeight = 40;

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(() => {
      loadMoreData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const newData = await fetchData(0, 30);
    setData(newData);
    setLoading(false);
  };

  const loadMoreData = async () => {
    if (loading || data.length >= totalRecords) return;
    setLoading(true);
    const newData = await fetchData(data.length, 10);
    setData((prevData) => [...prevData, ...newData]);
    setLoading(false);
  };

  // Infinite scrolling trigger (5 rows left)
  const handleScroll = ({ scrollHeight, scrollTop, clientHeight }) => {
    const totalRows = data.length;
    const lastVisibleRow = Math.floor((scrollTop + clientHeight) / rowHeight);

    console.log(`Total: ${totalRows}, Last Visible: ${lastVisibleRow}`);

    // If the last visible row is within 5 rows from the end, load more data
    if (totalRows - lastVisibleRow <= 5) {
      console.log("Fetching more data...");
      loadMoreData();
    }
  };

  // Handle sorting (skips index column)
  const handleSort = (column) => {
    if (column === "index") return; // Don't sort the index column

    let direction = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
    }
    setSortColumn(column);
    setSortDirection(direction);

    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  // Grid cell renderer
  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    if (rowIndex === 0) {
      return (
        <div
          key={key}
          style={{
            ...style,
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: allColumns[columnIndex].isIndex ? "default" : "pointer",
            borderBottom: "2px solid #ddd",
          }}
          onClick={() =>
            allColumns[columnIndex].isIndex
              ? null
              : handleSort(allColumns[columnIndex].accessorKey)
          }
        >
          {allColumns[columnIndex].header}{" "}
          {!allColumns[columnIndex].isIndex &&
          sortColumn === allColumns[columnIndex].accessorKey
            ? sortDirection === "asc"
              ? "▲"
              : "▼"
            : ""}
        </div>
      );
    }

    const row = data[rowIndex - 1];
    const column = allColumns[columnIndex];

    return (
      <div
        key={key}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #ddd",
          padding: "5px",
        }}
      >
        {column.isIndex ? rowIndex : row?.[column.accessorKey] || "Loading..."}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h3>Total Records: {data.length.toLocaleString()}</h3>

      <div
        style={{
          height: "600px",
          border: "1px solid #ddd",
          overflow: "scroll",
        }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <Grid
              ref={gridRef}
              cellRenderer={cellRenderer}
              columnCount={allColumns.length}
              columnWidth={({ index }) => allColumns[index].width}
              height={height}
              rowCount={data.length + 1} // +1 for header row
              rowHeight={rowHeight}
              width={width}
              overscanRowCount={10}
              onScroll={handleScroll}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default TableComponent;
