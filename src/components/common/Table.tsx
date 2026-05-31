interface Column<T> {
  key: string
  title: string
  render: (item: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (item: T) => string
}

export function Table<T>({ columns, data, rowKey }: TableProps<T>) {
  return (
    <div className="min-h-[56vh] overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100/70 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800/80">
      <table className="min-w-full border-separate border-spacing-0 text-left text-base">
        <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:text-slate-200"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={rowKey(item)}
              className={
                index % 2 === 0
                  ? 'bg-white transition hover:bg-sky-50/60 dark:bg-slate-900 dark:hover:bg-slate-800/70'
                  : 'bg-slate-50/60 transition hover:bg-sky-50/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/80'
              }
            >
              {columns.map((column) => (
                <td key={column.key} className="border-b border-slate-100 px-5 py-4 text-[15px] text-slate-700 dark:border-slate-800 dark:text-slate-200">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
