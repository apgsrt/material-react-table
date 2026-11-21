import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from '../src/index';

afterEach(cleanup);

type Person = { age: number; name: string };

const data: Person[] = [
  { age: 30, name: 'Charlie' },
  { age: 25, name: 'Alice' },
  { age: 35, name: 'Bob' },
  ...Array.from({ length: 22 }, (_, i) => ({
    age: 40 + i,
    name: `Person ${i + 4}`,
  })),
];

const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];

// `data-testid` in mui*Props objects is accepted by the option types
// (see MRT_DataAttributes in types.ts) and must reach the DOM. The one
// exception below is inside MUI-owned slotProps, whose types MRT cannot
// widen, so that single spot keeps a narrow cast.
const HeaderTable = () => {
  const table = useMaterialReactTable<Person>({
    columnFilterDisplayMode: 'popover',
    columns,
    data,
    enableColumnResizing: true,
    muiColumnActionMenuProps: ({ column }) => ({
      'data-testid': `col-action-menu-${column.id}`,
      slotProps: {
        paper: { 'data-testid': `col-action-menu-paper-${column.id}` } as any,
      },
    }),
    muiColumnActionsButtonProps: ({ column }) => ({
      'data-testid': `colactions-${column.id}`,
    }),
    muiTableHeadCellFilterLabelProps: ({ column }) => ({
      'data-testid': `filter-${column.id}`,
    }),
    muiTableHeadCellResizeHandleProps: ({ column }) => ({
      'data-testid': `resize-divider-${column.id}`,
      BoxProps: { 'data-testid': `resize-${column.id}` },
    }),
    muiTableHeadCellSortLabelProps: ({ column }) => ({
      'data-testid': `sort-${column.id}`,
      className: 'custom-sort-label',
    }),
  });
  return <MaterialReactTable table={table} />;
};

describe('header cell mui*Props propagation', () => {
  it('passes props to the sort, filter, actions, and resize handles per column', () => {
    render(<HeaderTable />);

    for (const col of ['name', 'age']) {
      expect(screen.getByTestId(`sort-${col}`)).toBeTruthy();
      expect(screen.getByTestId(`filter-${col}`)).toBeTruthy();
      expect(screen.getByTestId(`colactions-${col}`)).toBeTruthy();
      expect(screen.getByTestId(`resize-${col}`)).toBeTruthy();
      expect(screen.getByTestId(`resize-divider-${col}`)).toBeTruthy();
    }
    expect(screen.getByTestId('sort-name').className).toContain(
      'custom-sort-label',
    );
  });

  it('sorts when the sort handle with a test id is clicked', () => {
    render(<HeaderTable />);

    const firstRowName = () =>
      document.querySelector('tbody tr td')?.textContent;
    expect(firstRowName()).toBe('Charlie');

    fireEvent.click(screen.getByTestId('sort-name'));
    expect(firstRowName()).toBe('Alice');
    expect(
      screen.getByTestId('sort-name').closest('th')?.getAttribute('aria-sort'),
    ).toBe('ascending');
  });

  it('opens the column action menu with menu and paper slot props applied', () => {
    render(<HeaderTable />);

    fireEvent.click(screen.getByTestId('colactions-name'));

    expect(screen.getByTestId('col-action-menu-name')).toBeTruthy();
    expect(screen.getByTestId('col-action-menu-paper-name')).toBeTruthy();
    expect(screen.getByText('Sort by Name ascending')).toBeTruthy();
  });
});

const DefaultPaginationTable = () => {
  const table = useMaterialReactTable<Person>({
    columns,
    data,
    muiPaginationProps: {
      DisplayedRowsProps: { 'data-testid': 'displayed-rows' },
      FirstButtonProps: { 'data-testid': 'first-page' },
      LastButtonProps: { 'data-testid': 'last-page' },
      NextButtonProps: {
        'data-testid': 'next-page',
        className: 'custom-next-page',
      },
      PreviousButtonProps: { 'data-testid': 'prev-page' },
      RootProps: {
        'data-testid': 'pagination-root',
        className: 'custom-pagination-root',
      },
      SelectLabelProps: { 'data-testid': 'rpp-label' },
      SelectProps: {
        'data-testid': 'rpp-select',
        // MUI-owned nested type; cannot be widened by MRT
        inputProps: { 'data-testid': 'rpp-input' } as any,
      },
    },
  });
  return <MaterialReactTable table={table} />;
};

describe('pagination muiPaginationProps propagation (default mode)', () => {
  it('passes props to the root, label, select, displayed rows, and nav buttons', () => {
    render(<DefaultPaginationTable />);

    expect(screen.getByTestId('pagination-root').className).toContain(
      'MuiTablePagination-root',
    );
    expect(screen.getByTestId('pagination-root').className).toContain(
      'custom-pagination-root',
    );
    expect(screen.getByTestId('rpp-label').textContent).toContain(
      'Rows per page',
    );
    expect(screen.getByTestId('rpp-select')).toBeTruthy();
    // user inputProps merge with (not replace) the built-in id
    expect(screen.getByTestId('rpp-input').id).toContain('mrt-rows-per-page-');
    expect(screen.getByTestId('displayed-rows').textContent).toContain(
      '1-10 of 25',
    );
    expect(screen.getByTestId('next-page').className).toContain(
      'custom-next-page',
    );
  });

  it('navigates when the nav buttons with test ids are clicked', () => {
    render(<DefaultPaginationTable />);

    fireEvent.click(screen.getByTestId('next-page'));
    expect(screen.getByTestId('displayed-rows').textContent).toContain(
      '11-20 of 25',
    );

    fireEvent.click(screen.getByTestId('last-page'));
    expect(screen.getByTestId('displayed-rows').textContent).toContain(
      '21-25 of 25',
    );

    fireEvent.click(screen.getByTestId('prev-page'));
    expect(screen.getByTestId('displayed-rows').textContent).toContain(
      '11-20 of 25',
    );

    fireEvent.click(screen.getByTestId('first-page'));
    expect(screen.getByTestId('displayed-rows').textContent).toContain(
      '1-10 of 25',
    );
  });
});

const PagesPaginationTable = () => {
  const table = useMaterialReactTable<Person>({
    columns,
    data,
    muiPaginationProps: {
      'data-testid': 'pages-nav',
      PaginationItemProps: (item) => ({
        'data-testid': `page-item-${item.type}-${item.page}`,
      }),
    },
    paginationDisplayMode: 'pages',
  });
  return <MaterialReactTable table={table} />;
};

describe('pagination muiPaginationProps propagation (pages mode)', () => {
  it('passes props to the Pagination root and per-item via PaginationItemProps', () => {
    render(<PagesPaginationTable />);

    expect(screen.getByTestId('pages-nav')).toBeTruthy();
    expect(screen.getByTestId('page-item-page-1')).toBeTruthy();

    fireEvent.click(screen.getByTestId('page-item-page-2'));
    expect(
      screen.getByTestId('page-item-page-2').getAttribute('aria-current'),
    ).toBe('page');
  });
});
