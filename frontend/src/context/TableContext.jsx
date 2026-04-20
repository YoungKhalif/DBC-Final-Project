import { createContext, useState, useCallback } from 'react'

export const TableContext = createContext()

export function TableProvider({ children }) {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)

  const updateTableStatus = useCallback((tableId, status) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, status } : table
      )
    )
  }, [])

  return (
    <TableContext.Provider
      value={{ tables, selectedTable, setSelectedTable, updateTableStatus }}
    >
      {children}
    </TableContext.Provider>
  )
}
