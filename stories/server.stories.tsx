/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { Meta, Story } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { useTable } from '../src';

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
    title: 'Server',
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

const url = 'http://localhost:5000/api/v1/';

const Template: Story = (args) => {
    const columns = React.useMemo(
        () => [
            {
                label: 'Contact Name',
                name: 'name',
            },
            {
                label: 'Tags',
                name: 'tags',
                render: ({ value }) => {
                    return (
                        <>
                            {value.map((tag) => (
                                <span key={tag._id} color={tag.color}>
                                    {tag.name}
                                </span>
                            ))}
                        </>
                    );
                },
                // eslint-disable-next-line
                // Cell: ({ cell: { value } }: CellProps<{},TagDTO[]>) => {
                //     return (
                //         <>
                //             {value.map((tag: TagDTO) => (
                //                 <Badge key={tag._id} color={tag.color}>
                //                     {tag.name}
                //                 </Badge>
                //             ))}
                //         </>
                //     );
                // },
            },
            { label: 'Priority', name: 'priority' },
            { label: 'Source', name: 'source' },
            { label: 'Stage', name: 'workflow.name' },
            {
                label: 'Assigned To',
                name: 'salesPerson.name',
                render: ({ value }) => <>{value && value.first + ' ' + value.last}</>,
                // Cell: ({ cell: { value } }: CellProps<{}, EmployeeDTO>) => {
                //     return <>{value && <Name name={value?.name} />}</>;
                // },
            },
            // {
            //     label: 'Date Edited',
            //     accessor: 'editedBy.date',
            //     Filter: DateRangeColumnFilter,
            //     filter: 'dateBetween',
            //     Cell: ({ cell: { value } }: CellProps<{}, string>) => {
            //         return (
            //             <>
            //                 <Date datetime={value} />
            //             </>
            //         );
            //     },
            // },
        ],
        [],
    );

    const [leads, setLeads] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            const response = await fetch(`${url}leads`);
            const leads = await response.json();

            setLeads(leads.data);
        })();
    }, []);

    const data = React.useMemo(() => leads, [leads]);

    const { headers, rows, toggleSort } = useTable(columns, data, { sortable: true });

    const handleHeaderClick = (e, header) => {
        toggleSort(header.name);
    };

    const handleFilter = (value) => {
        console.log();
    };

    return (
        <Styles>
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx} onClick={(e) => handleHeaderClick(e, header)}>
                                {header.label}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>
                                <input type="text" onChange={(e) => handleFilter(e.target.value)} />
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
        </Styles>
    );
};

const columns = [
    {
        name: 'firstName',
        label: 'First Name',
        render: ({ value }) => <h1>{value}</h1>,
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
            name: 'Graham Rogers',
            date: Date.now(),
        },
    },
    {
        firstName: 'Samwise',
        lastName: 'Gamgee',
        editedBy: {
            name: 'Graham Rogers',
            date: Date.now(),
        },
    },
];

const MyTable = () => {
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

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});
export const Basic = MyTable.bind({});

Default.args = {};
