import Box, { type BoxProps } from '@mui/material/Box';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import InputLabel, { type InputLabelProps } from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination, {
  type PaginationProps,
  type PaginationRenderItemParams,
} from '@mui/material/Pagination';
import PaginationItem, {
  type PaginationItemProps,
} from '@mui/material/PaginationItem';
import Select, { type SelectProps } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { flipIconStyles, getCommonTooltipProps } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

const defaultRowsPerPage = [5, 10, 15, 20, 25, 30, 50, 100];

export interface MRT_TablePaginationProps<TData extends MRT_RowData>
  extends Partial<
    PaginationProps & {
      DisplayedRowsProps?: Partial<TypographyProps>;
      FirstButtonProps?: Partial<IconButtonProps>;
      LastButtonProps?: Partial<IconButtonProps>;
      NextButtonProps?: Partial<IconButtonProps>;
      PaginationItemProps?:
        | ((item: PaginationRenderItemParams) => Partial<PaginationItemProps>)
        | Partial<PaginationItemProps>;
      PreviousButtonProps?: Partial<IconButtonProps>;
      RootProps?: Partial<BoxProps>;
      SelectLabelProps?: Partial<InputLabelProps>;
      SelectProps?: Partial<SelectProps>;
      disabled?: boolean;
      rowsPerPageOptions?: { label: string; value: number }[] | number[];
      showRowsPerPage?: boolean;
    }
  > {
  position?: 'bottom' | 'top';
  table: MRT_TableInstance<TData>;
}

export const MRT_TablePagination = <TData extends MRT_RowData>({
  position = 'bottom',
  table,
  ...rest
}: MRT_TablePaginationProps<TData>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 720px)');

  const {
    getState,
    options: {
      enableToolbarInternalActions,
      icons: { ChevronLeftIcon, ChevronRightIcon, FirstPageIcon, LastPageIcon },
      id,
      localization,
      muiPaginationProps,
      paginationDisplayMode,
    },
  } = table;
  const {
    pagination: { pageIndex = 0, pageSize = 10 },
  } = getState();

  const paginationProps = {
    ...parseFromValuesOrFunc(muiPaginationProps, {
      table,
    }),
    ...rest,
  };

  const totalRowCount = table.getRowCount();
  const numberOfPages = table.getPageCount();
  const showFirstLastPageButtons = numberOfPages > 2;
  const firstRowIndex = pageIndex * pageSize;
  const lastRowIndex = Math.min(pageIndex * pageSize + pageSize, totalRowCount);

  const {
    DisplayedRowsProps,
    FirstButtonProps,
    LastButtonProps,
    NextButtonProps,
    PaginationItemProps,
    PreviousButtonProps,
    RootProps,
    SelectLabelProps,
    SelectProps = {},
    disabled = false,
    rowsPerPageOptions = defaultRowsPerPage,
    showFirstButton = showFirstLastPageButtons,
    showLastButton = showFirstLastPageButtons,
    showRowsPerPage = true,
    ...restPaginationProps
  } = paginationProps ?? {};

  const disableBack = pageIndex <= 0 || disabled;
  const disableNext = lastRowIndex >= totalRowCount || disabled;

  if (isMobile && SelectProps?.native !== false) {
    SelectProps.native = true;
  }

  const tooltipProps = getCommonTooltipProps();

  return (
    <Box
      {...RootProps}
      className={`MuiTablePagination-root${
        RootProps?.className ? ` ${RootProps.className}` : ''
      }`}
      sx={(theme) => ({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: { md: 'space-between', sm: 'center' },
        justifySelf: 'flex-end',
        mt:
          position === 'top' && enableToolbarInternalActions
            ? '3rem'
            : undefined,
        position: 'relative',
        px: '8px',
        py: '12px',
        zIndex: 2,
        ...(parseFromValuesOrFunc(RootProps?.sx, theme) as any),
      })}
    >
      {showRowsPerPage && (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <InputLabel
            htmlFor={`mrt-rows-per-page-${id}`}
            {...SelectLabelProps}
            sx={(theme) => ({
              mb: 0,
              ...(parseFromValuesOrFunc(SelectLabelProps?.sx, theme) as any),
            })}
          >
            {SelectLabelProps?.children ?? localization.rowsPerPage}
          </InputLabel>
          <Select
            disableUnderline
            disabled={disabled}
            label={localization.rowsPerPage}
            value={pageSize}
            variant="standard"
            {...SelectProps}
            MenuProps={{ disableScrollLock: true, ...SelectProps?.MenuProps }}
            inputProps={{
              'aria-label': localization.rowsPerPage,
              id: `mrt-rows-per-page-${id}`,
              ...SelectProps?.inputProps,
            }}
            onChange={(event, child) => {
              SelectProps?.onChange?.(event, child);
              table.setPageSize(+(event.target.value as any));
            }}
            sx={(theme) => ({
              mb: 0,
              ...(parseFromValuesOrFunc(SelectProps?.sx, theme) as any),
            })}
          >
            {rowsPerPageOptions.map((option) => {
              const value = typeof option !== 'number' ? option.value : option;
              const label =
                typeof option !== 'number' ? option.label : `${option}`;
              return (
                SelectProps?.children ??
                (SelectProps?.native ? (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ) : (
                  <MenuItem key={value} sx={{ m: 0 }} value={value}>
                    {label}
                  </MenuItem>
                ))
              );
            })}
          </Select>
        </Box>
      )}
      {paginationDisplayMode === 'pages' ? (
        <Pagination
          count={numberOfPages}
          disabled={disabled}
          page={pageIndex + 1}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          {...restPaginationProps}
          onChange={(event, newPageIndex) => {
            restPaginationProps?.onChange?.(event, newPageIndex);
            table.setPageIndex(newPageIndex - 1);
          }}
          renderItem={
            restPaginationProps?.renderItem ??
            ((item) => (
              <PaginationItem
                slots={{
                  first: FirstPageIcon,
                  last: LastPageIcon,
                  next: ChevronRightIcon,
                  previous: ChevronLeftIcon,
                }}
                {...parseFromValuesOrFunc(PaginationItemProps, item)}
                {...item}
              />
            ))
          }
        />
      ) : paginationDisplayMode === 'default' ? (
        <>
          <Typography
            align="center"
            component="span"
            variant="body2"
            {...DisplayedRowsProps}
            sx={(theme) => ({
              m: '0 4px',
              minWidth: '8ch',
              ...(parseFromValuesOrFunc(DisplayedRowsProps?.sx, theme) as any),
            })}
          >
            {DisplayedRowsProps?.children ??
              `${
                lastRowIndex === 0
                  ? 0
                  : (firstRowIndex + 1).toLocaleString(localization.language)
              }-${lastRowIndex.toLocaleString(localization.language)} ${
                localization.of
              } ${totalRowCount.toLocaleString(localization.language)}`}
          </Typography>
          <Box gap="xs">
            {showFirstButton && (
              <Tooltip {...tooltipProps} title={localization.goToFirstPage}>
                <span>
                  <IconButton
                    aria-label={localization.goToFirstPage}
                    size="small"
                    {...FirstButtonProps}
                    disabled={disableBack || !!FirstButtonProps?.disabled}
                    onClick={(event) => {
                      FirstButtonProps?.onClick?.(event);
                      table.firstPage();
                    }}
                  >
                    {FirstButtonProps?.children ?? (
                      <FirstPageIcon {...flipIconStyles(theme)} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip {...tooltipProps} title={localization.goToPreviousPage}>
              <span>
                <IconButton
                  aria-label={localization.goToPreviousPage}
                  size="small"
                  {...PreviousButtonProps}
                  disabled={disableBack || !!PreviousButtonProps?.disabled}
                  onClick={(event) => {
                    PreviousButtonProps?.onClick?.(event);
                    table.previousPage();
                  }}
                >
                  {PreviousButtonProps?.children ?? (
                    <ChevronLeftIcon {...flipIconStyles(theme)} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip {...tooltipProps} title={localization.goToNextPage}>
              <span>
                <IconButton
                  aria-label={localization.goToNextPage}
                  size="small"
                  {...NextButtonProps}
                  disabled={disableNext || !!NextButtonProps?.disabled}
                  onClick={(event) => {
                    NextButtonProps?.onClick?.(event);
                    table.nextPage();
                  }}
                >
                  {NextButtonProps?.children ?? (
                    <ChevronRightIcon {...flipIconStyles(theme)} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            {showLastButton && (
              <Tooltip {...tooltipProps} title={localization.goToLastPage}>
                <span>
                  <IconButton
                    aria-label={localization.goToLastPage}
                    size="small"
                    {...LastButtonProps}
                    disabled={disableNext || !!LastButtonProps?.disabled}
                    onClick={(event) => {
                      LastButtonProps?.onClick?.(event);
                      table.lastPage();
                    }}
                  >
                    {LastButtonProps?.children ?? (
                      <LastPageIcon {...flipIconStyles(theme)} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </>
      ) : null}
    </Box>
  );
};
