/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { get } from './utils';

interface Column<T> {
    name: string;
    label?: string;
    hidden?: boolean;
    render?: ({ value, row }: { value: any; row: T }) => React.ReactNode;
}

// this was ColumnState<T>
interface ColumnState {
    name: string;
    label: string;
    hidden: boolean;
    filtered?: {
        value: string;
    };
}

interface ColumnByNames<T> {
    [key: string]: Column<T>;
}

interface Data {
    [key: string]: any;
}

type ManualPaginationOptions = {
    manual: boolean;
    pages: number;
};

interface TableOptions {
    pagination?: boolean | ManualPaginationOptions;
}

type Cell = {
    value: any;
    render: () => React.ReactNode;
};

interface Row<T extends Data> {
    id: number;
    cells: Cell[];
    hidden?: boolean;
    original: T;
}

type Header<T> = {
    name: string;
    label?: string;
    hidden?: boolean;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    render: () => React.ReactNode;
    // filter: (name: string, value: string) => void;
};

type HeaderRender = ({ label }: { label: any }) => React.ReactNode;

/** State Definition */
type TableState<T extends Data> = {
    columnsByName: ColumnByNames<T>;
    columns: ColumnState[];
    rows: Row<T>[];
    originalRows: Row<T>[];
};

type TableAction<T extends Data> =
    | { type: 'SET_ROWS'; data: Row<T>[] }
    | { type: 'FILTER_COLUMN'; columnName: string; value: string };

const createReducer = <T extends Data>() => (state: TableState<T>, action: TableAction<T>): TableState<T> => {
    switch (action.type) {
        case 'SET_ROWS':
            const rows = [...action.data];

            return {
                ...state,
                rows,
                originalRows: action.data,
            };
        case 'FILTER_COLUMN':
            const columnsCopy = state.columns.map((column) => {
                // if the column name from the action matches a column, add the filtered value to the header state
                if (action.columnName === column.name) {
                    return {
                        ...column,
                        filtered: { value: action.value },
                    };
                }
                // if we don't match, return the column like nothing happened
                return { ...column };
            });

            return {
                ...state,
                columns: columnsCopy,
            };
        default:
            throw new Error('Invalid reducer action');
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useFilterTable = <T extends Data>(columns: Column<T>[], data: T[], _options?: TableOptions) => {
    // mapping columns to internal state
    const mappedColumns = React.useMemo(
        () =>
            columns.map((column) => {
                // assign values to these fields if not assigned in the columns passed in
                return {
                    ...column,
                    label: column?.label ?? column.name,
                    hidden: column?.hidden ?? false,
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
    });

    // setting rows to state on render
    React.useEffect(() => dispatch({ type: 'SET_ROWS', data: tableData }), [tableData]);

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
        dispatch, // not sure we want to expose dispatch here????
        filter: (columnName: string, value: string) => dispatch({ type: 'FILTER_COLUMN', columnName, value }),
    };
};

const makeRender = <T extends Data>(
    value: any,
    render: (({ value, row }: { value: any; row: T }) => React.ReactNode) | undefined,
    row: T,
) => {
    return render ? () => render({ row, value }) : () => value;
};

const makeHeaderRender = (label: string, render: HeaderRender | undefined) => {
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
