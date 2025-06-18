import React, { type HTMLProps } from "react";
import { BaseTable } from "../../app/shared/components/BaseTable";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState
} from "@tanstack/react-table";

import { IconButton } from "@mui/material";

export default function TableDemo() {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
        cell: ({ row }) => {
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
                {row.original && "role" in row.original ? row.original.role.title : null}
              </div>
            );
          } else {
            return "name" in row.original ? (
              <div style={{ textAlign: "right" }}>{row.original.name.title}</div>
            ) : null;
          }
        }
      },

      {
        header: "Department",
        accessorFn: (row) => ("department" in row ? row.department : ""),
        cell: (info) => info.getValue()
      },
      {
        header: "Email",
        accessorFn: (row) => ("email" in row ? row.email : ""),
        cell: (info) => info.getValue()
      },
      {
        header: "Extension",
        accessorFn: (row) => ("extension" in row ? row.extension : ""),
        cell: ({ row, getValue }) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{getValue() as string}</span>
            {row.depth > 0 && <IconButton onClick={() => {}}>📝</IconButton>}
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
      rowSelection
    },
    getSubRows: (row) => ("users" in row ? row.users : undefined),
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true
  });

  return <BaseTable table={table} />;
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
