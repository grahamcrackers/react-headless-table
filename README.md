<h3 align="center">
  react-headless-table
</h3>

<p align="center">
  A react table that's easy to use, easy to customize.
</p>

[![License:
MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![release](https://img.shields.io/badge/release-super%20alpha-red)

Inspired by [react-table](https://github.com/tannerlinsley/react-table) but with Typescript support built in and a simpler API.
Forked from [react-final-table](https://github.com/Buuntu/react-final-table)

## Features

-   Type safe
-   ~Global row filtering~
-   Row selection~
-   Custom column rendering
-   Column sorting
-   Data memoization for performance
-   **Zero** dependencies

## Table of Contents

-   [Motivation](#motivation)
-   [Install](#install)
-   [Demos](#demos)
    -   [CodeSandbox Demo](#codesandbox-demo)
    -   [Material UI Demo](#material-ui-demo)
-   [`useTable`](#usetable)
-   [Examples](#examples)
    -   [Basic example](#basic-example)
    -   [Searching](#searching)
    -   [Row Selection](#row-selection)
    -   [Pagination](#pagination)
-   [Performance](#performance)
-   [Contributing](#contributing)

## Motivation

Yes, another table component. This is inspired by `react-table` but v7 seems
to be all over the place with a crazy api that just doesn't look good. It's
also lacking native typescript support and is just a big turn off. I also needed
an easier to use controlled component for server side table rendering but still
kept track of state so that I wouldn't have to maintain state outside of the table.

## Install

```bash
npm install react-headless-table
```

## Demos

## `useTable`

This is the main hook exposed by the library and should be your entrypoint for
any table functionality. Only `columns` and `rows` are required as arguments:

```jsx
const { headers, rows } = useTable(columns, rows);
```

1. `columns`: The first argument is an array of columns of type ColumnType. Only
   the name of each column is required. Each column has the following type
   signature:

```typescript
type ColumnType<T> = {
    name: string;
    label?: string;
    hidden?: boolean;
    sort?: ((a: RowType<T>, b: RowType<T>) => number) | undefined;
    render?: ({ value, row }: { value: any; row: T }) => React.ReactNode;
    headerRender?: ({ label }: { label: string }) => React.ReactNode;
};
```

2. `rows`: Rows is the second argument to useTable and can be an array of any
   _object_ type.

## Examples

### Basic example

```tsx
import { useTable } from 'react-final-table';

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
];

const data = [
    {
        firstName: 'Frodo',
        lastName: 'Baggins',
    },
    {
        firstName: 'Samwise',
        lastName: 'Gamgee',
    },
];

const MyTable = () => {
    const { headers, rows } = useTable(columns, data);

    return (
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
    );
};
```

### Searching

```jsx
const Table: FC = () => {
    const { headers, rows, setSearchString } = useTable(
      columns,
      data,
    );

    return (
      <>
        <input
          type="text"
          onChange={e => {
            setSearchString(e.target.value);
          }}
        ></input>
        <table>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx}>
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
      </>
    );
```

### Row Selection

```jsx
import React, { useMemo } from 'react';
import { useTable } from 'react-final-table';
import makeData from 'makeData'; // replace this with your own data

function App() {
    const { columns, rows } = makeData();

    const { headers, rows, selectRow, selectedRows } = useTable(memoColumns, memoData, {
        selectable: true,
    });

    return (
        <>
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
        </>
    );
}
```

### Pagination

```jsx
export const App: FC = () => {
  const memoColumns = useMemo(() => columns, []);
  const memoData = useMemo(() => data, []);

  const { headers, rows, pagination } = useTable<{
    firstName: string;
    lastName: string;
  }>(memoColumns, memoData, { pagination: true });

  return (
    <>
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
        <button
          disabled={pagination.canPrev}
          onClick={() => pagination.prevPage()}
        >
          {'<'}
        </button>
        <button
          disabled={pagination.canNext}
          onClick={() => pagination.nextPage()}
        >
          {'>'}
        </button>
      </div>
    </>
  );
}
```

## Performance

It's recommended that you memoize your columns and data using `useMemo`. This is
to prevent the table from rerendering everytime your component rerenders, which
can have negative consequences on performance.

## Contributing

Contributing is welcome. Please read the [CONTRIBUTING doc](CONTRIBUTING.md) for more.
