import { createContext, useState, useCallback } from 'react'

export const OrderContext = createContext()

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([
    {
      id: 1,
      tableId: 2,
      status: 'pending',
      items: [
        { id: 1, name: 'Pasta Carbonara', quantity: 1, price: 12.99 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  const createOrder = useCallback((tableId, items) => {
    const newOrder = {
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      tableId,
      status: 'pending',
      items,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setOrders(prev => [...prev, newOrder])
    return newOrder
  }, [orders])

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    )
  }, [])

  const addItemToOrder = useCallback((orderId, item) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, items: [...order.items, item] }
          : order
      )
    )
  }, [])

  const removeItemFromOrder = useCallback((orderId, itemId) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, items: order.items.filter(i => i.id !== itemId) }
          : order
      )
    )
  }, [])

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        addItemToOrder,
        removeItemFromOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
