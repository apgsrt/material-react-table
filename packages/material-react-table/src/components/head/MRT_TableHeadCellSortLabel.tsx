import Badge, { type BadgeProps } from '@mui/material/Badge';
import TableSortLabel, {
  type TableSortLabelProps,
} from '@mui/material/TableSortLabel';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadCellSortLabelProps<TData extends MRT_RowData>
  extends TableSortLabelProps {
  BadgeProps?: Partial<BadgeProps>;
  TooltipProps?: Partial<TooltipProps>;
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellSortLabel = <TData extends MRT_RowData>({
  header,
  table,
  ...rest
}: MRT_TableHeadCellSortLabelProps<TData>) => {
  const {
    getState,
    options: {
      icons: { ArrowDownwardIcon, SyncAltIcon },
      localization,
      muiTableHeadCellSortLabelProps,
    },
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { isLoading, showSkeletons, sorting } = getState();

  const { BadgeProps, TooltipProps, ...tableSortLabelProps } = {
    ...parseFromValuesOrFunc(muiTableHeadCellSortLabelProps, {
      column,
      table,
    }),
    ...parseFromValuesOrFunc(columnDef.muiTableHeadCellSortLabelProps, {
      column,
      table,
    }),
    ...rest,
  };

  const isSorted = !!column.getIsSorted();

  const sortTooltip =
    isLoading || showSkeletons
      ? ''
      : column.getIsSorted()
        ? column.getIsSorted() === 'desc'
          ? localization.sortedByColumnDesc.replace(
              '{column}',
              columnDef.header,
            )
          : localization.sortedByColumnAsc.replace('{column}', columnDef.header)
        : column.getNextSortingOrder() === 'desc'
          ? localization.sortByColumnDesc.replace('{column}', columnDef.header)
          : localization.sortByColumnAsc.replace('{column}', columnDef.header);

  const direction = isSorted
    ? (column.getIsSorted() as 'asc' | 'desc')
    : undefined;

  return (
    <Tooltip placement="top" title={sortTooltip} {...TooltipProps}>
      <Badge
        badgeContent={sorting.length > 1 ? column.getSortIndex() + 1 : 0}
        overlap="circular"
        {...BadgeProps}
      >
        <TableSortLabel
          IconComponent={
            !isSorted
              ? (props) => (
                  <SyncAltIcon
                    {...props}
                    direction={direction}
                    style={{
                      transform: 'rotate(-90deg) scaleX(0.9) translateX(-1px)',
                    }}
                  />
                )
              : ArrowDownwardIcon
          }
          active
          aria-label={sortTooltip}
          direction={direction}
          {...tableSortLabelProps}
          onClick={(e) => {
            e.stopPropagation();
            tableSortLabelProps?.onClick?.(e as any);
            header.column.getToggleSortingHandler()?.(e);
          }}
          sx={(theme) => ({
            '.MuiTableSortLabel-icon': {
              color: `${
                theme.palette.mode === 'dark'
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary
              } !important`,
            },
            flex: '0 0',
            opacity: isSorted ? 1 : 0.3,
            transition: 'all 150ms ease-in-out',
            width: '3ch',
            ...(parseFromValuesOrFunc(tableSortLabelProps?.sx, theme) as any),
          })}
        />
      </Badge>
    </Tooltip>
  );
};
