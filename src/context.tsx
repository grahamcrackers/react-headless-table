import React from 'react';
import { useTable } from './hooks';

const TableContext = React.createContext<any | null>(null);

export function useTableContext() {
    const context = React.useContext(TableContext);
    if (context === null) {
        const err = new Error(`useTable() is missing a parent <TableProvider /> component.`);
        if (Error.captureStackTrace) Error.captureStackTrace(err, useTableContext);
        throw err;
    }
    return context;
}

export const TableProvider = ({ children, columns, data, ...options }: any) => {
    const tableProps = useTable(columns, data, options);

    return <TableContext.Provider value={{ ...tableProps }}>{children}</TableContext.Provider>;
};
