"use client";
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Table
} from "@mui/material";
import { flexRender, useReactTable, type Row } from "@tanstack/react-table";

import { Fragment } from "react";

interface BaseTableProps<T> {
  table: ReturnType<typeof useReactTable<T>>;
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
}

export function BaseTable<T>({ table, renderSubComponent }: BaseTableProps<T>) {
  const hasExpandableRows =
    !!renderSubComponent && table.getRowModel().rows.some((row) => row.getCanExpand());

  return table.getRowModel().rows?.length ? (
    <TableContainer
      component={Paper}
      sx={{ overflow: "auto" }}
    >
      <Table
        stickyHeader
        sx={{ minWidth: "100%" }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: header.column.getSize(),
                    fontWeight: "bold"
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      width: cell.column.getSize()
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {hasExpandableRows && row.getIsExpanded() && renderSubComponent && (
                <TableRow>
                  <TableCell
                    colSpan={row.getVisibleCells().length}
                    sx={{
                      p: 0,
                      backgroundColor: "#fff",
                      borderTop: 0
                    }}
                  >
                    {renderSubComponent({ row })}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <div>No Result</div>
  );
}
