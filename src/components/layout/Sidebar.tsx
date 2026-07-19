import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore, extractRole } from '@/stores/authStore'
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
  ArrowRightLeft,
  UserCog,
  PersonStanding,
  ChevronDown,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'

interface NavItem {
  type: 'item'
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

interface NavCollapsible {
  type: 'collapsible'
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  items: NavItem[]
}

type NavEntry = NavItem | NavCollapsible

const navEntries: NavEntry[] = [
  { type: 'item', to: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
  { type: 'item', to: '/athletes', label: 'Atletas', icon: Users, roles: ['ADMIN', 'COACH'] },
  { type: 'item', to: '/coaches', label: 'Entrenadores', icon: Dumbbell, roles: ['ADMIN', 'COACH'] },
  { type: 'item', to: '/gyms', label: 'Gimnasios', icon: Building2, roles: ['ADMIN'] },
  { type: 'item', to: '/competitions', label: 'Competencias', icon: Trophy, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
  { type: 'item', to: '/gym-registrations', label: 'Inscripciones Gimnasio', icon: Trophy, roles: ['ADMIN', 'COACH'] },
  { type: 'item', to: '/payments', label: 'Pagos', icon: CreditCard, roles: ['ADMIN', 'COACH'] },
  {
    type: 'collapsible',
    label: 'Gestión Admin',
    icon: Shield,
    roles: ['ADMIN'],
    items: [
      { type: 'item', to: '/competition-divisions', label: 'Divisiones', icon: Trophy, roles: ['ADMIN'] },
      { type: 'item', to: '/pago-movil', label: 'Pago Movil', icon: Smartphone, roles: ['ADMIN'] },
      { type: 'item', to: '/users', label: 'Usuarios', icon: UserCog, roles: ['ADMIN'] },
      { type: 'item', to: '/persons', label: 'Personas', icon: PersonStanding, roles: ['ADMIN'] },
      { type: 'item', to: '/admin-coaches', label: 'Entrenadores (Admin)', icon: Dumbbell, roles: ['ADMIN'] },
      { type: 'item', to: '/admin-athletes', label: 'Atletas (Admin)', icon: Users, roles: ['ADMIN'] },
    ],
  },
  { type: 'item', to: '/settings', label: 'Configuracion', icon: Settings, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
]

export function Sidebar() {
  const { user, hasAnyRole, viewAs, setViewAs } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const location = useLocation()

  const adminItems = navEntries.find(e => e.type === 'collapsible' && e.label === 'Gestión Admin')
  const isAdminRouteActive = adminItems?.type === 'collapsible'
    ? adminItems.items.some(item => location.pathname === item.to)
    : false
  const [adminOpen, setAdminOpen] = useState(isAdminRouteActive)

  useEffect(() => {
    if (isAdminRouteActive) setAdminOpen(true)
  }, [isAdminRouteActive])

  const userRole = user ? extractRole(user) : ''
  const hasBothRoles = hasAnyRole(['COACH']) && hasAnyRole(['ATHLETE'])

  const filterByRole = (roles: string[]) => {
    if (!userRole) return true
    if (hasBothRoles) {
      if (viewAs === 'ATHLETE') return roles.includes('ATHLETE')
      return roles.some((r) => r.toUpperCase() === userRole)
    }
    return roles.some((r) => r.toUpperCase() === userRole)
  }

  const filteredEntries = navEntries.filter((entry) => filterByRole(entry.roles))

  const isCollapsibleActive = (entry: NavCollapsible) =>
    entry.items.some((item) => location.pathname === item.to)

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200"
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
            <span className="font-semibold text-lg">Sistema Libre</span>
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

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-65px)]">
          {hasBothRoles && (
            <div className="mb-4 p-2 bg-sidebar-foreground/5 rounded-md">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 mb-2">
                <ArrowRightLeft className="h-3 w-3" />
                <span>Vista como:</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={viewAs === 'COACH' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setViewAs('COACH')}
                >
                  Entrenador
                </Button>
                <Button
                  variant={viewAs === 'ATHLETE' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setViewAs('ATHLETE')}
                >
                  Atleta
                </Button>
              </div>
            </div>
          )}

          {filteredEntries.map((entry) => {
            if (entry.type === 'collapsible') {
              const isActive = isCollapsibleActive(entry)
              return (
                <div key={entry.label}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <entry.icon className="h-5 w-5" />
                      {entry.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        adminOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {adminOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-foreground/10 pl-3">
                      {entry.items
                        .filter((item) => filterByRole(item.roles))
                        .map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                              )
                            }
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={entry.to}
                to={entry.to}
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
                <entry.icon className="h-5 w-5" />
                {entry.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
