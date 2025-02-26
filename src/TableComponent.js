import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Virtuoso } from "react-virtuoso";
import axios from "axios";
import ColumnSelector from "./ColumnSelector";

// Define all available columns
const allColumns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "body", header: "Body" },
];

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.map((col) => col.accessorKey)
  );

  // Fetch data with lazy loading
  const fetchData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_start=${
          (page - 1) * 30
        }&_limit=30`
      );
      setData((prevData) => [...prevData, ...response.data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Define the table instance
  const visibleColumns = useMemo(
    () => allColumns.filter((col) => selectedColumns.includes(col.accessorKey)),
    [selectedColumns]
  );

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      {/* Column Selector Component */}
      <ColumnSelector
        columns={allColumns}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />

      <div
        style={{ height: "500px", border: "1px solid #ddd", padding: "10px" }}
      >
        <Virtuoso
          style={{ height: "100%" }}
          data={table.getRowModel().rows}
          rangeChanged={(range) => {
            const remainingRows =
              table.getRowModel().rows.length - range.endIndex;
            if (!loading && remainingRows <= 10) {
              fetchData();
            }
          }}
          overscan={10}
          itemContent={(index, row) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} style={{ flex: 1 }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          )}
        />

        {loading && <p style={{ textAlign: "center" }}>Loading more data...</p>}
      </div>
    </div>
  );
};

export default TableComponent;
