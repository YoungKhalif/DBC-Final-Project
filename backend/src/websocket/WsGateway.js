/**
 * WsGateway - Socket.IO WebSocket handler
 * Manages rooms (per-branch), user connections, and broadcasts
 */
class WsGateway {
  constructor(io) {
    this.io = io
    this.userSockets = new Map() // userId -> Set<socketId>
    this.branchRooms = new Map() // branchId -> Set<socketId>
    this.setupNamespace()
  }

  setupNamespace() {
    this.ns = this.io.of('/api/realtime')

    this.ns.on('connection', (socket) => {
      console.log(`[WS] Client connected: ${socket.id}`)

      // Join branch room
      socket.on('join:branch', (branchId, userId) => {
        socket.join(`branch:${branchId}`)
        
        // Track user for direct messaging
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set())
        }
        this.userSockets.get(userId).add(socket.id)

        // Track branch room
        if (!this.branchRooms.has(branchId)) {
          this.branchRooms.set(branchId, new Set())
        }
        this.branchRooms.get(branchId).add(socket.id)

        socket.emit('join:success', { branchId, userId })
        console.log(`[WS] User ${userId} joined branch ${branchId}`)
      })

      socket.on('disconnect', () => {
        // Cleanup user socket tracking
        for (const [userId, sockets] of this.userSockets.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id)
            if (sockets.size === 0) {
              this.userSockets.delete(userId)
            }
          }
        }

        // Cleanup branch room tracking
        for (const [branchId, sockets] of this.branchRooms.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id)
            if (sockets.size === 0) {
              this.branchRooms.delete(branchId)
            }
          }
        }

        console.log(`[WS] Client disconnected: ${socket.id}`)
      })
    })
  }

  /**
   * Emit to all users in a branch room
   */
  emitToBranch(branchId, event, data) {
    this.ns.to(`branch:${branchId}`).emit(event, data)
  }

  /**
   * Emit to a specific user (if connected)
   */
  emitToUser(userId, event, data) {
    const sockets = this.userSockets.get(userId)
    if (sockets && sockets.size > 0) {
      sockets.forEach((socketId) => {
        this.ns.to(socketId).emit(event, data)
      })
    }
  }

  /**
   * Emit to specific users (array)
   */
  emitToUsers(userIds, event, data) {
    userIds.forEach((userId) => this.emitToUser(userId, event, data))
  }

  /**
   * Get connected user count for a branch
   */
  getBranchUserCount(branchId) {
    const sockets = this.branchRooms.get(branchId)
    return sockets ? sockets.size : 0
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    const sockets = this.userSockets.get(userId)
    return sockets && sockets.size > 0
  }
}

module.exports = WsGateway
