import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PersonasPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Personas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Persona management features will be available in the next update</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create and manage AI personas with distinct personalities and writing styles.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}