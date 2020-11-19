import React from 'react';
import { useTable } from './hooks';

const ControlledTableContext = React.createContext<any | null>(null);

export function useControlledTableContext() {
    const context = React.useContext(ControlledTableContext);
    if (context === null) {
        const err = new Error(`useTable() is missing a parent <TableProvider /> component.`);
        if (Error.captureStackTrace) Error.captureStackTrace(err, useControlledTableContext);
        throw err;
    }
    return context;
}

export const ControlledTableProvider = ({ children, columns, data, ...options }: any) => {
    const tableProps = useTable(columns, data, options);

    return <ControlledTableContext.Provider value={{ ...tableProps }}>{children}</ControlledTableContext.Provider>;
};
