import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  // Role-based menu items
  const getNavItems = () => {
    const common = [{ path: '/', label: 'Dashboard' }]
    
    const roleMenus = {
      waiter: [
        { path: '/tables', label: 'Tables' },
        { path: '/orders', label: 'Orders' },
        { path: '/reservations', label: 'Reservations' }
      ],
      chef: [
        { path: '/orders', label: 'Kitchen Board' }
      ],
      receptionist: [
        { path: '/reservations', label: 'Reservations' },
        { path: '/tables', label: 'Tables' }
      ],
      manager: [
        { path: '/tables', label: 'Tables' },
        { path: '/orders', label: 'Orders' },
        { path: '/menu', label: 'Menu' },
        { path: '/reservations', label: 'Reservations' },
        { path: '/staff', label: 'Staff' },
        { path: '/payments', label: 'Payments' }
      ]
    }

    return [...common, ...(roleMenus[user?.role] || [])]
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">RMS</h1>
          <p className="text-sm text-gray-400">Restaurant Management</p>
        </div>

        <ul className="mt-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-6 py-3 transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 bg-gray-900">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold">{user?.name}</p>
            <div className="inline-block mt-1 px-2 py-1 bg-green-700 text-xs rounded">
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

