import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Building2,
  Trophy,
  CreditCard,
  Smartphone,
  Settings,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { to: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
  { to: '/athletes', label: 'Atletas', icon: Users, roles: ['ADMIN', 'COACH'] },
  { to: '/coaches', label: 'Entrenadores', icon: Dumbbell, roles: ['ADMIN'] },
  { to: '/gyms', label: 'Gimnasios', icon: Building2, roles: ['ADMIN'] },
  { to: '/competitions', label: 'Competencias', icon: Trophy, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
  { to: '/payments', label: 'Pagos', icon: CreditCard, roles: ['ADMIN', 'COACH'] },
  { to: '/pago-movil', label: 'Pago Movil', icon: Smartphone, roles: ['ADMIN'] },
  { to: '/settings', label: 'Configuracion', icon: Settings, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  )

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-foreground/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="font-semibold text-lg">Free System</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-foreground/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
