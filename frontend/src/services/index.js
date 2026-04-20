import client from './api'

export const authService = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),
  logout: () =>
    client.post('/auth/logout'),
  getCurrentUser: () =>
    client.get('/auth/me'),
  refreshToken: () =>
    client.post('/auth/refresh')
}

export const tableService = {
  getTables: (branchId) =>
    client.get(`/tables?branchId=${branchId}`),
  getTable: (tableId) =>
    client.get(`/tables/${tableId}`),
  updateTable: (tableId, data) =>
    client.put(`/tables/${tableId}`, data),
  getTableStatus: (tableId) =>
    client.get(`/tables/${tableId}/status`)
}

export const orderService = {
  createOrder: (data) =>
    client.post('/orders', data),
  getOrder: (orderId) =>
    client.get(`/orders/${orderId}`),
  updateOrder: (orderId, data) =>
    client.put(`/orders/${orderId}`, data),
  updateOrderStatus: (orderId, status) =>
    client.patch(`/orders/${orderId}/status`, { status })
}

export const menuService = {
  getMenu: (branchId) =>
    client.get(`/menu?branchId=${branchId}`),
  getMenuSection: (sectionId) =>
    client.get(`/menu/sections/${sectionId}`),
  getMenuItems: (sectionId) =>
    client.get(`/menu/items?sectionId=${sectionId}`)
}

export const reservationService = {
  createReservation: (data) =>
    client.post('/reservations', data),
  getReservations: (branchId, date) =>
    client.get(`/reservations?branchId=${branchId}&date=${date}`),
  updateReservation: (reservationId, data) =>
    client.put(`/reservations/${reservationId}`, data),
  cancelReservation: (reservationId) =>
    client.delete(`/reservations/${reservationId}`)
}

export const billService = {
  createBill: (orderId) =>
    client.post(`/bills/order/${orderId}`),
  getBill: (billId) =>
    client.get(`/bills/${billId}`),
  processPayment: (billId, paymentData) =>
    client.post(`/bills/${billId}/payment`, paymentData)
}
