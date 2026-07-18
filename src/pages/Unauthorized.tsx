import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">403</h1>
        <p className="text-xl text-muted-foreground mb-6">Acceso Denegado</p>
        <p className="text-muted-foreground mb-6">
          No tienes permiso para acceder a esta pagina.
        </p>
        <Link to="/dashboard">
          <Button>Ir al Panel de Control</Button>
        </Link>
      </div>
    </div>
  )
}
