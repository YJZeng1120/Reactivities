import React, { type HTMLProps } from "react";
import { BaseTable } from "../../app/shared/components/BaseTable";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ExpandedState,
  type FilterFn
} from "@tanstack/react-table";
import { IconButton } from "@mui/material";
import viewByRoleExample from "../../assets/view_by_role_example.json";

const globalFilterFnComplete: FilterFn<DataItem | User> = (row, columnId, filterValue) => {
  const original = row.original;
  const searchTexts: string[] = [];

  if (row.depth === 0) {
    // 父列 - 搜尋 role title
    if ("role" in original) {
      searchTexts.push(original.role.title);
    }
  } else {
    // 子列 - 搜尋所有使用者資訊
    if ("name" in original) {
      searchTexts.push(
        original.name.title,
        original.department,
        original.email,
        original.extension
      );
    }
  }

  const haystack = searchTexts.filter(Boolean).join(" ").toLowerCase();
  const needle = filterValue.toLowerCase();

  return haystack.includes(needle);
};
export default function TableDemo() {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<DataItem | User>[]>(
    () => [
      {
        id: "select",
        size: 50,
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        id: "role",
        header: "Role / Principal",
        accessorFn: (row) => ("role" in row ? row.role.title : ""),
        cell: (cellContext) => {
          const { row } = cellContext;
          if (row.depth === 0) {
            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                {row.getCanExpand() ? (
                  <IconButton onClick={row.getToggleExpandedHandler()}>
                    {row.getIsExpanded() ? "👇" : "👉"}
                  </IconButton>
                ) : (
                  <span style={{ width: "2rem" }} />
                )}
                <HighlightCell {...cellContext} />
              </div>
            );
          } else {
            const nameTitle =
              "name" in cellContext.row.original ? cellContext.row.original.name.title : "";
            return (
              <div style={{ textAlign: "right" }}>
                <HighlightCell
                  {...cellContext}
                  value={nameTitle}
                />
              </div>
            );
          }
        }
      },
      {
        accessorKey: "department",
        header: "Department",
        size: 400,
        accessorFn: (row) => ("department" in row ? row.department : ""),
        cell: (cellContext) => <HighlightCell {...cellContext} />
      },
      {
        accessorKey: "email",
        header: "Email",
        accessorFn: (row) => ("email" in row ? row.email : ""),
        cell: (cellContext) => <HighlightCell {...cellContext} />
      },
      {
        accessorKey: "extension",
        header: "Extension",
        accessorFn: (row) => ("extension" in row ? row.extension : ""),
        cell: (cellContext) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <HighlightCell
              {...cellContext}
              value={cellContext.getValue() as string}
            />
            {cellContext.row.depth > 0 && <IconButton onClick={() => {}}>📝</IconButton>}
          </div>
        )
      }
    ],
    []
  );

  const mockData: DataItem[] = viewByRoleExample as DataItem[];
  const table = useReactTable({
    data: mockData,
    columns,
    state: {
      expanded,
      rowSelection,
      globalFilter
    },
    getSubRows: (row) => ("users" in row ? row.users : undefined),
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFnComplete,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFromLeafRows: true,
    defaultColumn: {
      size: 300
    }
  });

  return (
    <>
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search all columns..."
        style={{ marginBottom: 12, padding: 8, width: 280 }}
      />
      <BaseTable table={table} />
    </>
  );
}

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

function HighlightCell<TData, TValue>(context: CellContext<TData, TValue> & { value?: string }) {
  const rawValue = context.value ?? context.cell.getValue();
  const value = rawValue == null ? "" : String(rawValue);
  const search = context.table.getState().globalFilter as string;

  if (!search) return <span>{value}</span>;

  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = value.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        regex.test(part) ? <mark key={idx}>{part}</mark> : <span key={idx}>{part}</span>
      )}
    </span>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
