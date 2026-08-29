import React from 'react';
import { cn } from '@/lib/utils';

type TableProps = {
  children: React.ReactNode;
  className?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ children, className, ...props }, ref) => (
  <table ref={ref} className={cn("w-full border-collapse border border-gray-200", className)} {...props}>
    {children}
  </table>
));

Table.displayName = "Table";

type TableRowProps = {
  children: React.ReactNode;
  className?: string;
};
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ children, className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b", className)} {...props}>
    {children}
  </tr>
));

TableRow.displayName = "TableRow";

type TableHeadProps = {
  children: React.ReactNode;
  className?: string;
};
const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(({ children, className, ...props }) => (
  <th className={cn("px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", className)} {...props}>
    {children}
  </th>
));

TableHead.displayName = "TableHead";

type TableCellProps = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
};
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ children, className, align = 'left', ...props }) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : '';
  return (
    <td className={cn(
      "px-4 py-3 text-sm text-gray-500 border-b",
      alignClass,
      className
    )} {...props}>
      {children}
    </td>
  );
});

TableCell.displayName = "TableCell";

type TableRowHeaderProps = {
  children: React.ReactNode;
  className?: string;
};
const TableRowHeader = React.forwardRef<HTMLTableRowElement, TableRowHeaderProps>(({ children, className, ...props }, ref) => (
  <tr ref={ref} className={cn("bg-gray-50", className)} {...props}>
    {children}
  </tr>
));

TableRowHeader.displayName = "TableRowHeader";

export { Table, TableRow, TableHead, TableCell, TableRowHeader };