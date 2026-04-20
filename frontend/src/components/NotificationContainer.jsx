import { useContext, useEffect } from 'react'
import { NotificationContext } from '../context/NotificationContext'

export default function NotificationContainer() {
  const { notifications } = useContext(NotificationContext)

  return (
    <div className="fixed top-4 right-4 z-40 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

function NotificationItem({ notification }) {
  const { removeNotification } = useContext(NotificationContext)

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, removeNotification])

  const bgColor = {
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  return (
    <div className={`${bgColor[notification.type] || bgColor.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between`}>
      <span>{notification.message}</span>
      <button
        onClick={() => removeNotification(notification.id)}
        className="ml-4 text-xl leading-none hover:opacity-70"
      >
        ×
      </button>
    </div>
  )
}
