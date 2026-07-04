import { Bell, Plus, Search } from 'lucide-react'
import { useCurrentAdmin } from '../../features/auth/useCurrentAdmin'
import Avatar from '../ui/Avatar'

export default function Topbar() {
  const { admin } = useCurrentAdmin()

  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-8 py-4">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search orders, customers, drivers..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-button border-0 bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full border-0 bg-transparent p-2 text-muted hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-primary">
              {admin?.name ?? 'Admin User'}
            </p>
            <p className="text-[11px] font-semibold tracking-wide text-muted">SUPER ADMIN</p>
          </div>
          <Avatar name={admin?.name ?? 'Admin User'} photoUrl={admin?.avatarUrl} size={40} />
        </div>
      </div>
    </header>
  )
}
