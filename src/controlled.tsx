/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { get } from './utils';

interface Column<T> {
    name: string;
    label?: string;
    hidden?: boolean;
    render?: ({ value, row }: { value: any; row: T }) => React.ReactNode;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    filter?: (value: string) => void;
}

// this was ColumnState<T>
interface ColumnState<T> {
    name: string;
    label: string;
    hidden: boolean;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
    sorted: {
        on: boolean;
        asc?: boolean;
    };
    filtered?: {
        value: unknown;
    };
}

interface ColumnByNames<T> {
    [key: string]: Column<T>;
}

interface Data {
    [key: string]: any;
}

type PaginationOptions = {
    pages: number;
};

interface TableOptions {
    pagination?: boolean | PaginationOptions;
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
    render: () => React.ReactNode;
    filter?: (value: string) => void;
    sort?: ((a: Row<T>, b: Row<T>) => number) | undefined;
};

type HeaderRender = ({ label }: { label: any }) => React.ReactNode;

type Paginator = {
    nextPage: () => void;
    prevPage: () => void;
    page: number;
    perPage: number;
    canNext: boolean;
    canPrev: boolean;
};

/** State Definition */
type TableState<T extends Data> = {
    columnsByName: ColumnByNames<T>;
    columns: ColumnState<T>[];
    rows: Row<T>[];
    originalRows: Row<T>[];
    selectedRows: Row<T>[];
    toggleAllState: boolean;
    sortColumn: string | null;
    paginationEnabled: boolean;
    paginationOptions?: PaginationOptions | null;
    pagination: Paginator;
};

type TableAction<T extends Data> =
    | { type: 'SET_ROWS'; data: Row<T>[] }
    | { type: 'FILTER_COLUMN'; columnName: string; value: unknown }
    | { type: 'TOGGLE_SORT'; columnName: string }
    | { type: 'TOGGLE_FILTER'; columnName: string }
    | { type: 'TOGGLE_ALL' }
    | { type: 'NEXT_PAGE' }
    | { type: 'PREV_PAGE' }
    | { type: 'SELECT_ROW'; rowId: number };

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
            const columns = state.columns.map((column) => {
                // if the column name from the action matches a column, add the filtered value to the header state
                if (action.columnName === column.name) {
                    // if no value remove filtered object
                    if (!action.value) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { filtered, ...rest } = column;
                        return { ...rest };
                    }

                    // add filter value to header column object
                    return {
                        ...column,
                        filtered: {
                            value: action.value,
                        },
                    };
                }
                // if we don't match, return the column like nothing happened
                return { ...column };
            });

            return {
                ...state,
                columns: columns,
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
        case 'NEXT_PAGE':
            const nextPage = state.pagination.page + 1;

            if (state.paginationOptions) {
                return {
                    ...state,
                    pagination: {
                        ...state.pagination,
                        page: nextPage,
                        canNext:
                            nextPage * state.pagination.perPage <
                            state.paginationOptions.pages * state.pagination.perPage,
                        canPrev: nextPage !== 1,
                    },
                };
            }
            return {
                ...state,
                // rows: getPaginatedData(state.originalRows, state.pagination.perPage, nextPage),
                // pagination: {
                //     ...state.pagination,
                //     page: nextPage,
                //     canNext: nextPage * state.pagination.perPage < state.originalRows.length,
                //     canPrev: nextPage !== 1,
                // },
            };
        case 'PREV_PAGE':
            const prevPage = state.pagination.page === 1 ? 1 : state.pagination.page - 1;

            if (state.paginationOptions) {
                return {
                    ...state,
                    pagination: {
                        ...state.pagination,
                        page: prevPage,
                        canNext:
                            prevPage * state.pagination.perPage <
                            state.paginationOptions.pages * state.pagination.perPage,
                        canPrev: prevPage !== 1,
                    },
                };
            }
            return {
                ...state,
                // rows: getPaginatedData(state.originalRows, state.pagination.perPage, prevPage),
                // pagination: {
                //     ...state.pagination,
                //     page: prevPage,
                //     canNext: prevPage * state.pagination.perPage < state.originalRows.length,
                //     canPrev: prevPage !== 1,
                // },
            };
        case 'SELECT_ROW':
            const stateCopy = { ...state };

            stateCopy.rows = stateCopy.rows.map((row) => {
                const newRow = { ...row };
                if (newRow.id === action.rowId) {
                    newRow.selected = !newRow.selected;
                }
                return newRow;
            });

            stateCopy.originalRows = stateCopy.originalRows.map((row) => {
                const newRow = { ...row };
                if (newRow.id === action.rowId) {
                    newRow.selected = !newRow.selected;
                }
                return newRow;
            });

            stateCopy.selectedRows = stateCopy.originalRows.filter((row) => row.selected === true);

            stateCopy.toggleAllState =
                stateCopy.selectedRows.length === stateCopy.rows.length
                    ? (stateCopy.toggleAllState = true)
                    : (stateCopy.toggleAllState = false);

            return stateCopy;
        case 'TOGGLE_ALL':
            const stateCopyToggle = { ...state };
            const rowIds: { [key: number]: boolean } = {};

            if (state.selectedRows.length < state.rows.length) {
                stateCopyToggle.rows = stateCopyToggle.rows.map((row) => {
                    rowIds[row.id] = true;
                    return { ...row, selected: true };
                });

                stateCopyToggle.toggleAllState = true;
            } else {
                stateCopyToggle.rows = stateCopyToggle.rows.map((row) => {
                    rowIds[row.id] = false;

                    return { ...row, selected: false };
                });
                stateCopyToggle.toggleAllState = false;
            }

            stateCopyToggle.originalRows = stateCopyToggle.originalRows.map((row) => {
                return row.id in rowIds ? { ...row, selected: rowIds[row.id] } : { ...row };
            });

            stateCopyToggle.selectedRows = stateCopyToggle.originalRows.filter((row) => row.selected);

            return stateCopyToggle;
        default:
            throw new Error('Invalid reducer action');
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useControlledTable = <T extends Data>(columns: Column<T>[], data: T[], options?: TableOptions) => {
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
        selectedRows: [],
        toggleAllState: false, // will need to access refs for all inputs
        sortColumn: null,
        paginationEnabled: !!options?.pagination,
        paginationOptions: typeof options?.pagination === 'object' ? options?.pagination : null,
        pagination: {
            page: 1,
            perPage: 10,
            canNext: true,
            canPrev: false,
            nextPage: () => {},
            prevPage: () => {},
        },
    });

    // pagination controls
    state.pagination.nextPage = React.useCallback(() => dispatch({ type: 'NEXT_PAGE' }), [dispatch]);
    state.pagination.prevPage = React.useCallback(() => dispatch({ type: 'PREV_PAGE' }), [dispatch]);

    // setting rows to state on render
    React.useEffect(() => dispatch({ type: 'SET_ROWS', data: tableData }), [tableData]);

    const headers: Header<T>[] = React.useMemo(() => {
        return [
            ...state.columns.map((column: any) => {
                const label = column.label ? column.label : column.name;
                return {
                    ...column,
                    render: makeHeaderRender(label, column.headerRender),
                    // provide a filter on the header object
                    filter: (value: string) => {
                        dispatch({ type: 'FILTER_COLUMN', columnName: column.name, value });
                    },
                };
            }),
        ];
    }, [state.columns]);

    return {
        headers: headers.filter((column) => !column.hidden),
        rows: state.rows,
        originalRows: state.originalRows,
        selectedRows: state.selectedRows,
        dispatch, // not sure we want to expose dispatch here????
        selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
        toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
        toggleSort: (columnName: string) => dispatch({ type: 'TOGGLE_SORT', columnName }),
        pagination: state.pagination,
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
