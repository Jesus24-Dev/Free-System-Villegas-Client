import { useAuthStore, extractRole } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, User } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  const roleLabel = user ? extractRole(user) : ''

  return (
    <header className="h-16 border-b border-border/50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden hover:bg-muted">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">Sistema Libre Villegas</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline text-foreground/80">{user?.email}</span>
          <span className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-sm">
            {roleLabel}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
