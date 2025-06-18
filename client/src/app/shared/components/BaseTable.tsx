"use client";
import { Paper } from "@mui/material";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
interface BaseTableProps<T> {
  height?: number;
  maxHeight?: number;
  table: ReturnType<typeof useReactTable<T>>;
}

export function BaseTable<T>({ table, height = 40, maxHeight = 900 }: BaseTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => height,
    overscan: 20
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();
  const totalWidth = table.getTotalSize();

  return rows.length ? (
    <Paper
      sx={{
        width: "100%",
        maxHeight: `${maxHeight}px`,
        overflowX: "auto",
        overflowY: "auto"
      }}
      ref={parentRef}
    >
      <div style={{ minWidth: totalWidth }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #ccc",
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "white"
          }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                style={{
                  flex: `0 0 ${header.column.getSize()}px`,
                  padding: "8px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))
          )}
        </div>

        {/* Body */}
        <div
          style={{
            height: `${totalHeight}px`,
            position: "relative"
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "flex",
                  alignItems: "center",
                  height: `${height}px`,
                  borderBottom: "1px solid #eee"
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      flex: `0 0 ${cell.column.getSize()}px`,
                      padding: "8px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Paper>
  ) : (
    <div>No Result</div>
  );
}
