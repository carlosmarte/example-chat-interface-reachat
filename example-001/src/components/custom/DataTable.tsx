import './DataTable.css'

export interface DataTableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps {
  columns: DataTableColumn[]
  data: Record<string, any>[]
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  title?: string
}

export function DataTable({
  columns,
  data,
  striped = true,
  bordered = true,
  compact = false,
  title
}: DataTableProps) {
  return (
    <div className="custom-data-table-wrapper">
      {title && <h4 className="custom-data-table-title">{title}</h4>}
      <div className="custom-data-table-container">
        <table
          className={`
            custom-data-table
            ${striped ? 'custom-data-table--striped' : ''}
            ${bordered ? 'custom-data-table--bordered' : ''}
            ${compact ? 'custom-data-table--compact' : ''}
          `.trim()}
        >
          <thead className="custom-data-table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`custom-data-table-th custom-data-table-th--${column.align || 'left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="custom-data-table-body">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="custom-data-table-empty"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="custom-data-table-row">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`custom-data-table-td custom-data-table-td--${column.align || 'left'}`}
                    >
                      {row[column.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
