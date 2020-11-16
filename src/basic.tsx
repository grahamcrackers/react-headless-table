import React from 'react';
import { get } from './utils';

/**
 * Dictionary of string, value pairs
 */
type Dictionary<T> = { [key: string]: T };

interface Column<T> {
    name: string;
    label?: string;
    hidden?: boolean;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    render?: ({ value, row }: { value: any; row: T }) => React.ReactNode;
}

interface ColumnState<T> {
    name: string;
    label: string;
    hidden: boolean;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    sorted: {
        on: boolean;
        asc?: boolean;
    };
}

interface ColumnByNames<T> {
    [key: string]: Column<T>;
}

interface Data {
    [key: string]: any;
}

interface TableOptions {
    manual?: boolean;
}

type Cell = {
    value: any;
    render: () => React.ReactNode;
};

interface Row<T extends Data> {
    id: number;
    cells: Cell[];
    hidden?: boolean;
    selected?: boolean;
    original: T;
}

type Header<T> = {
    name: string;
    label?: string;
    hidden?: boolean;
    sorted: {
        on: boolean;
        asc?: boolean;
    };
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    render: () => React.ReactNode;
};

type HeaderRenderType = ({ label }: { label: any }) => React.ReactNode;

/** State Definition */
type TableState<T extends Data> = {
    columnsByName: ColumnByNames<T>;
    columns: ColumnState<T>[];
    rows: Row<T>[];
    originalRows: Row<T>[];
    sortColumn: string | null;
};

type TableAction<T extends Data> = { type: 'SET_ROWS'; data: Row<T>[] } | { type: 'TOGGLE_SORT'; columnName: string };

const createReducer = <T extends Data>() => (state: TableState<T>, action: TableAction<T>): TableState<T> => {
    switch (action.type) {
        case 'SET_ROWS':
            const rows = [...action.data];

            return {
                ...state,
                rows,
                originalRows: action.data,
            };
        case 'TOGGLE_SORT':
            if (!(action.columnName in state.columnsByName)) {
                throw new Error(`Invalid column, ${action.columnName} not found`);
            }

            let isAscending = null;

            // loop through all columns and set the sort parameter to off unless
            // it's the specified column (only one column at a time for )
            const columnCopy = state.columns.map((column) => {
                // if the row was found
                if (action.columnName === column.name) {
                    // if it's undefined, start by setting to ascending, otherwise toggle
                    isAscending = column.sorted.asc === undefined ? true : !column.sorted.asc;

                    return {
                        ...column,
                        sorted: {
                            on: true,
                            asc: isAscending,
                        },
                    };
                }
                // set sorting to false for all other columns
                return {
                    ...column,
                    sorted: {
                        on: false,
                        asc: false,
                    },
                };
            });

            return {
                ...state,
                columns: columnCopy,
                sortColumn: action.columnName,
                columnsByName: getColumnsByName(columnCopy),
            };
        default:
            throw new Error('Invalid reducer action');
    }
};

export const useManualTable = <T extends Data>(columns: Column<T>[], data: T[], options?: TableOptions) => {
    // mapping columns to internal state
    const mappedColumns = React.useMemo(
        () =>
            columns.map((column) => {
                // assign values to these fields if not assigned in the columns passed in
                return {
                    ...column,
                    label: column?.label ?? column.name,
                    hidden: column?.hidden ?? false,
                    sort: column.sort,
                    sorted: {
                        on: false,
                    },
                };
            }),
        [columns],
    );
    const columnsByName = React.useMemo(() => getColumnsByName(mappedColumns), [mappedColumns]);

    // mapping data to internal state
    const tableData: Row<T>[] = React.useMemo(() => {
        const mappedRows = mapRows(data, mappedColumns);
        const newData = mappedRows.map((row, idx) => {
            return {
                // need something besides index here
                id: idx,
                selected: false,
                hidden: false,
                original: row,
                cells: Object.entries(row)
                    .map(([column, value]) => {
                        return {
                            hidden: columnsByName[column].hidden,
                            field: column,
                            value: value,
                            render: makeRender(value, columnsByName[column].render, row),
                        };
                    })
                    .filter((cell) => !cell.hidden),
            };
        });
        return newData;
    }, [data, mappedColumns, columnsByName]);

    const reducer = createReducer<T>();

    const [state, dispatch] = React.useReducer(reducer, {
        columns: mappedColumns,
        columnsByName: columnsByName,
        originalRows: tableData,
        rows: tableData,
        sortColumn: null,
    });

    React.useEffect(() => {
        dispatch({ type: 'SET_ROWS', data: tableData });
    }, [tableData]);

    const headers: Header<T>[] = React.useMemo(() => {
        return [
            ...state.columns.map((column: any) => {
                const label = column.label ? column.label : column.name;
                return {
                    ...column,
                    render: makeHeaderRender(label, column.headerRender),
                };
            }),
        ];
    }, [state.columns]);

    return {
        headers: headers.filter((column) => !column.hidden),
        rows: state.rows,
        originalRows: state.originalRows,
        dispatch, // not sure we want to expose dispatch here
        toggleSort: (columnName: string) => dispatch({ type: 'TOGGLE_SORT', columnName }),
    };
};

const makeRender = <T extends Data>(
    value: any,
    render: (({ value, row }: { value: any; row: T }) => React.ReactNode) | undefined,
    row: T,
) => {
    return render ? () => render({ row, value }) : () => value;
};

const makeHeaderRender = (label: string, render: HeaderRenderType | undefined) => {
    return render ? () => render({ label }) : () => label;
};

const mapRows = <T extends Data>(data: T[], columns: Column<T>[]): T[] => {
    return data.map((row: any) => {
        const newRow: any = {};
        columns.forEach((column) => {
            // come back for a more robust object check
            // if (!(column.name in row)) {
            //     throw new Error(`Invalid row data, ${column.name} not found`);
            // }
            // newRow[column.name] = row[column.name];

            // get nested column values with the `get` function, this get function will
            // also bypass key values if the key is not provided in the object
            const path = column.name.split('.');
            newRow[column.name] = get(path, row);
        });
        return newRow;
    });
};

const getColumnsByName = <T extends Data>(columns: Column<T>[]): ColumnByNames<T> => {
    const columnsByName: ColumnByNames<T> = {};
    columns.forEach((column) => {
        const col: any = {
            label: column.label,
        };

        if (column.render) {
            col['render'] = column.render;
        }
        col['hidden'] = column.hidden;

        columnsByName[column.name] = col;
    });

    return columnsByName;
};

const getPaginatedData = <T extends Data>(rows: Row<T>[], perPage: number, page: number) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return rows.slice(start, end);
};
