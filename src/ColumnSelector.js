import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
} from "@mui/material";

const ColumnSelector = ({ columns, selectedColumns, setSelectedColumns }) => {
  const [allSelected, setAllSelected] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;

    if (value.includes("all")) {
      setAllSelected(!allSelected);
      setSelectedColumns(
        allSelected ? [] : columns.map((col) => col.accessorKey)
      );
    } else {
      setSelectedColumns(value);
      setAllSelected(value.length === columns.length);
    }
  };

  return (
    <FormControl style={{ width: 250, marginBottom: 10 }}>
      <InputLabel>Select Columns</InputLabel>
      <Select
        multiple
        value={selectedColumns}
        onChange={handleChange}
        renderValue={(selected) => selected.join(", ")}
      >
        <MenuItem value="all">
          <Checkbox checked={allSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>
        {columns.map((col) => (
          <MenuItem key={col.accessorKey} value={col.accessorKey}>
            <Checkbox checked={selectedColumns.includes(col.accessorKey)} />
            <ListItemText primary={col.header} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ColumnSelector;
