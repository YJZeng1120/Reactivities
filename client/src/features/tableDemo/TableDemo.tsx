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
    filterFromLeafRows: true
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

const mockData: DataItem[] = [
  {
    role: {
      id: "test",
      title: "TEST"
    },
    users: [
      {
        name: {
          id: "A004005",
          title: "Rita Zeng"
        },
        department: "BAHW",
        email: "rita_zeng@example.com",
        extension: "2391",
        isAdmin: false
      }
    ]
  },
  {
    role: {
      id: "test2",
      title: "TEST2"
    },
    users: [
      {
        name: {
          id: "A004005",
          title: "Rita Zeng"
        },
        department: "BAHW",
        email: "rita_zeng@example.com",
        extension: "2391",
        isAdmin: false
      },
      {
        name: {
          id: "A004006",
          title: "John Chen"
        },
        department: "BAHW",
        email: "john_chen@example.com",
        extension: "2392",
        isAdmin: false
      },
      {
        name: {
          id: "A004007",
          title: "Emily Wang"
        },
        department: "BAHW Software Engineering Sec._SC",
        email: "emily_wang@example.com",
        extension: "2393",
        isAdmin: true
      },
      {
        name: {
          id: "A004008",
          title: "Michael Liu"
        },
        department: "BAHW Hardware Development Sec._SC",
        email: "michael_liu@example.com",
        extension: "2394",
        isAdmin: false
      },
      {
        name: {
          id: "A004009",
          title: "Sarah Lin"
        },
        department: "BAHW Quality Assurance Sec._SC",
        email: "sarah_lin@example.com",
        extension: "2395",
        isAdmin: false
      },
      {
        name: {
          id: "A004010",
          title: "David Wu"
        },
        department: "BAHW",
        email: "david_wu@example.com",
        extension: "2396",
        isAdmin: true
      },
      {
        name: {
          id: "A004011",
          title: "Amy Huang"
        },
        department: "BAHW Project Management Sec._SC",
        email: "amy_huang@example.com",
        extension: "2397",
        isAdmin: false
      },
      {
        name: {
          id: "A004012",
          title: "Tom Yang"
        },
        department: "BAHW Software Engineering Sec._SC",
        email: "tom_yang@example.com",
        extension: "2398",
        isAdmin: false
      },
      {
        name: {
          id: "A004013",
          title: "Lisa Chang"
        },
        department: "BAHW Hardware Development Sec._SC",
        email: "lisa_chang@example.com",
        extension: "2399",
        isAdmin: true
      },
      {
        name: {
          id: "A004014",
          title: "Kevin Tsai"
        },
        department: "BAHW",
        email: "kevin_tsai@example.com",
        extension: "2400",
        isAdmin: false
      },
      {
        name: {
          id: "A004015",
          title: "Grace Lee"
        },
        department: "BAHW Quality Assurance Sec._SC",
        email: "grace_lee@example.com",
        extension: "2401",
        isAdmin: false
      },
      {
        name: {
          id: "A004016",
          title: "Peter Su"
        },
        department: "BAHW",
        email: "peter_su@example.com",
        extension: "2402",
        isAdmin: true
      },
      {
        name: {
          id: "A004017",
          title: "Nancy Kao"
        },
        department: "BAHW Software Engineering Sec._SC",
        email: "nancy_kao@example.com",
        extension: "2403",
        isAdmin: false
      },
      {
        name: {
          id: "A004018",
          title: "Steven Ho"
        },
        department: "BAHW Hardware Development Sec._SC",
        email: "steven_ho@example.com",
        extension: "2404",
        isAdmin: false
      },
      {
        name: {
          id: "A004019",
          title: "Cindy Chu"
        },
        department: "BAHW Project Management Sec._SC",
        email: "cindy_chu@example.com",
        extension: "2405",
        isAdmin: true
      },
      {
        name: {
          id: "A004020",
          title: "Alan Kuo"
        },
        department: "BAHW",
        email: "alan_kuo@example.com",
        extension: "2406",
        isAdmin: false
      },
      {
        name: {
          id: "A004021",
          title: "Vicky Shen"
        },
        department: "BAHW Quality Assurance Sec._SC",
        email: "vicky_shen@example.com",
        extension: "2407",
        isAdmin: false
      },
      {
        name: {
          id: "A004022",
          title: "Henry Liao"
        },
        department: "BAHW Software Engineering Sec._SC",
        email: "henry_liao@example.com",
        extension: "2408",
        isAdmin: true
      },
      {
        name: {
          id: "A004023",
          title: "Jenny Hsu"
        },
        department: "BAHW Hardware Development Sec._SC",
        email: "jenny_hsu@example.com",
        extension: "2409",
        isAdmin: false
      },
      {
        name: {
          id: "A004024",
          title: "Frank Lin"
        },
        department: "BAHW",
        email: "frank_lin@example.com",
        extension: "2410",
        isAdmin: false
      }
    ]
  }
];
