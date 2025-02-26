# Infinite Scroll Table with React, TanStack Table & react-virtuoso

This project demonstrates an **infinite scrolling table** using **React, TanStack Table, and react-virtuoso**. It efficiently loads data in chunks and fetches new data **when 10 rows are left to scroll**.

---

## 🛠️ Step-by-Step Setup

### 1️⃣ Install Node.js (if not installed)
Ensure you have **Node.js** installed. You can check by running:
```sh
node -v
```
If not installed, download and install it from [Node.js official site](https://nodejs.org/).

### 2️⃣ Create a New React App
```sh
npx create-react-app infinite-scroll-table
cd infinite-scroll-table
```

### 3️⃣ Install Dependencies
```sh
npm install @tanstack/react-table react-virtuoso axios
```

### 4️⃣ Create the Table Component
Create a new file **`src/TableComponent.js`** and add the following code:

```jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Virtuoso } from "react-virtuoso";
import axios from "axios";

const allColumns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "body", header: "Body" },
];

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_start=${(page - 1) * 30}&_limit=30`
      );
      setData((prevData) => [...prevData, ...response.data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  useEffect(() => {
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <div style={{ height: "500px", border: "1px solid #ddd", padding: "10px" }}>
        <Virtuoso
          style={{ height: "100%" }}
          data={table.getRowModel().rows}
          rangeChanged={(range) => {
            const remainingRows = table.getRowModel().rows.length - range.endIndex;
            if (!loading && remainingRows <= 10) {
              fetchData();
            }
          }}
          overscan={10}
          itemContent={(index, row) => (
            <div key={row.id} style={{ display: "flex", padding: "10px", borderBottom: "1px solid #ddd" }}>
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
```

### 5️⃣ Modify `App.js`
Open **`src/App.js`** and replace its contents with:

```jsx
import React from "react";
import TableComponent from "./TableComponent";

function App() {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Infinite Scroll Table</h2>
      <TableComponent />
    </div>
  );
}

export default App;
```

### 6️⃣ Run the Project
```sh
npm start
```
Your application will be available at **http://localhost:3000/** 🚀

---

## 📜 License  
This project is **MIT Licensed**.  

## 🤝 Contributing  
Feel free to submit issues and pull requests.  

## 🌟 Show Your Support  
If you find this project helpful, please **⭐ Star** the repo!  

Happy Coding! 🚀

