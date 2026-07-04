import {
  BarChart3,
  Car,
  CreditCard,
  LayoutGrid,
  LogOut,
  Map,
  Megaphone,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Layers,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOutAdmin } from '../../lib/auth'

interface NavItem {
  label: string
  icon: typeof LayoutGrid
  path?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Customers', icon: Users },
  { label: 'Drivers', icon: Car },
  { label: 'Payments & Credits', icon: CreditCard },
  { label: 'Vehicle Classes', icon: Layers },
  { label: 'Fare Configuration', icon: SlidersHorizontal },
  { label: 'Service Areas', icon: Map },
  { label: 'Managers', icon: ShieldCheck },
  { label: 'Promotions', icon: Megaphone },
  { label: 'Analytics & Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOutAdmin()
    navigate('/')
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-primary text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex items-center justify-center rounded-lg bg-accent p-1.5">
          <Car className="h-5 w-5 text-white" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-lg font-bold leading-tight">2Go Admin</p>
          <p className="text-[10px] tracking-[0.2em] text-slate-400">ENTERPRISE CONTROL</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition ${
                      isActive
                        ? 'border-l-4 border-accent bg-white/10 text-white'
                        : 'border-l-4 border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border-l-4 border-transparent bg-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
