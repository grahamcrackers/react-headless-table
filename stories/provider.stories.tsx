/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { Meta, Story } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { makeData } from './make-data';
import { useTable } from '../src';
import { TableProvider, useTableContext } from '../src/context';

const Styles = (styled as any).div`
    padding: 1rem;

    table {
        border-spacing: 0;
        border: 1px solid black;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid black;
            border-right: 1px solid black;

            :last-child {
                border-right: 0;
            }
        }
    }
`;

const meta: Meta = {
    title: 'Provider',
    // component: ,
    argTypes: {
        children: {
            control: {
                type: 'text',
            },
        },
    },
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

const Template: Story = (args) => {
    const columns = React.useMemo(
        () => [
            {
                label: 'First Name',
                name: 'firstName',
            },
            {
                label: 'Last Name',
                name: 'lastName',
            },
            {
                label: 'Age',
                name: 'age',
            },
            {
                label: 'Visits',
                name: 'visits',
            },
            {
                label: 'Status',
                name: 'status',
            },
            {
                label: 'Profile Progress',
                name: 'progress',
            },
        ],
        [],
    );

    const data = React.useMemo(() => makeData(23), []);

    const { headers, rows } = useTable(columns, data);

    return (
        <Styles>
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => {
                        return (
                            <tr key={idx}>
                                {row.cells.map((cell, idx) => (
                                    <td key={idx}>{cell.render()}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Styles>
    );
};

const columns = [
    {
        name: 'firstName',
        label: 'First Name',
        // render: ({ value }) => <h1>{value}</h1>,
    },
    {
        name: 'lastName',
        label: 'Last Name',
    },
    {
        name: 'editedBy.name',
        label: 'Edited By',
    },
];

const data = [
    {
        firstName: 'Frodo',
        lastName: 'Baggins',
        editedBy: {
            name: 'Gandalf Greybeard',
            date: Date.now(),
        },
    },
    {
        firstName: 'Samwise',
        lastName: 'Gamgee',
        editedBy: {
            name: 'Gandalf Greybeard',
            date: Date.now(),
        },
    },
];

const BasicTable = () => {
    const memoColumns = React.useMemo(() => columns, []);
    const memoData = React.useMemo(() => data, []);
    const { headers, rows } = useTable(memoColumns, memoData);

    return (
        <Styles>
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            {row.cells.map((cell, idx) => (
                                <td key={idx}>{cell.render()}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Styles>
    );
};

const SearchTable = () => {
    const memoColumns = React.useMemo(() => columns, []);
    const memoData = React.useMemo(() => data, []);
    const { headers, rows, setSearchString } = useTable(memoColumns, memoData);

    return (
        <Styles>
            <input
                type="text"
                onChange={(e) => {
                    setSearchString(e.target.value);
                }}
            ></input>
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header.render()}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            {row.cells.map((cell, idx) => (
                                <td key={idx}>{cell.render()}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Styles>
    );
};

const RowSelectTable = () => {
    const memoColumns = React.useMemo(() => columns, []);
    const memoData = React.useMemo(() => data, []);
    const { headers, rows, selectRow, selectedRows } = useTable(memoColumns, memoData, {
        selectable: true,
    });

    console.log(selectedRows);
    return (
        <Styles>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        selectRow(row.id);
                                    }}
                                />
                            </td>
                            {row.cells.map((cell, idx) => (
                                <td key={idx}>{cell.render()}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Styles>
    );
};

export const PaginationTable = () => {
    const columns = React.useMemo(
        () => [
            {
                label: 'First Name',
                name: 'firstName',
            },
            {
                label: 'Last Name',
                name: 'lastName',
            },
            {
                label: 'Age',
                name: 'age',
            },
            {
                label: 'Visits',
                name: 'visits',
            },
            {
                label: 'Status',
                name: 'status',
            },
            {
                label: 'Profile Progress',
                name: 'progress',
            },
        ],
        [],
    );

    const memoData = React.useMemo(() => makeData(23), []);

    const { headers, rows, pagination } = useTable(columns, memoData, { pagination: true });

    console.log(headers);
    return (
        <Styles>
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header.render()}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            {row.cells.map((cell, idx) => (
                                <td key={idx}>{cell.render()}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button disabled={!pagination.canPrev} onClick={() => pagination.prevPage()}>
                    {'<'}
                </button>
                <button disabled={!pagination.canNext} onClick={() => pagination.nextPage()}>
                    {'>'}
                </button>
            </div>
        </Styles>
    );
};

const TestTable = () => {
    const { headers, rows, toggleSort } = useTableContext();

    return (
        <table>
            <thead>
                <tr>
                    {headers.map((header, idx) => (
                        <th key={idx} onClick={() => toggleSort(header.name)}>
                            {header.render()}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        {row.cells.map((cell, idx) => (
                            <td key={idx}>{cell.render()}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const FromContext = () => {
    const { headers, rows } = useTableContext();

    return (
        <pre>
            <code>{JSON.stringify(headers, null, 4)}</code>
        </pre>
    );
};
export const SortableTable = () => {
    const columns = React.useMemo(
        () => [
            {
                label: 'First Name',
                name: 'firstName',
            },
            {
                label: 'Last Name',
                name: 'lastName',
            },
            {
                label: 'Age',
                name: 'age',
            },
            {
                label: 'Visits',
                name: 'visits',
            },
            {
                label: 'Status',
                name: 'status',
            },
            {
                label: 'Profile Progress',
                name: 'progress',
            },
        ],
        [],
    );

    const memoData = React.useMemo(() => makeData(23), []);

    const { headers, rows, toggleSort, ...rest } = useTable(columns, memoData, { sortable: true, manual: true });

    return (
        <TableProvider columns={columns} data={memoData} options={{ ...rest }}>
            <Styles>
                <div style={{ display: 'flex' }}>
                    <TestTable />
                    <FromContext />
                </div>

                {/* <table>
                    <thead>
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx} onClick={() => toggleSort(header.name)}>
                                    {header.render()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {row.cells.map((cell, idx) => (
                                    <td key={idx}>{cell.render()}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </Styles>
        </TableProvider>
    );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});
export const Basic = BasicTable.bind({});
export const Search = SearchTable.bind({});
export const RowSelect = RowSelectTable.bind({});
export const Pagination = PaginationTable.bind({});
export const Sortable = SortableTable.bind({});

Default.args = {};
