import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="text-2xl font-semibold">Not Found</h2>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}

export function ServerNotFound() {
  return (
    <div className="flex flex-col py-8 px-8">
      <h1 className="text-8xl font-bold text-muted-foreground/20">404.</h1>
      <div className="font-mono text-xl text-muted-foreground">
        Opops! Not Found
      </div>
    </div>
  )
}
