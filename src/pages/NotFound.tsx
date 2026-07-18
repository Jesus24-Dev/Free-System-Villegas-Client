import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Pagina No Encontrada</p>
        <p className="text-muted-foreground mb-6">
          La pagina que buscas no existe.
        </p>
        <Link to="/dashboard">
          <Button>Ir al Panel de Control</Button>
        </Link>
      </div>
    </div>
  )
}
