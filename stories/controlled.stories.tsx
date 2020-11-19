/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { Meta, Story } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { makeData } from './make-data';
import { useControlledTable } from '../src';

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
    title: 'Filters',
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

    const data = React.useMemo(() => makeData(10), []);

    const { headers, rows } = useControlledTable(columns, data);

    return (
        <div style={{ display: 'flex' }}>
            <Styles>
                <table>
                    <thead>
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx}>{header.label}</th>
                            ))}
                        </tr>
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx}>
                                    <input
                                        type="input"
                                        onChange={(e) => {
                                            header.filter(e.target.value);
                                            // just store the value for now
                                            // filter(header.name, e.target.value);
                                        }}
                                    />
                                </th>
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
            <div>
                <h3>Headers</h3>
                <pre>
                    <code>{JSON.stringify(headers, null, 4)}</code>
                </pre>
            </div>
        </div>
    );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});
// export const Basic = BasicTable.bind({});

Default.args = {};
