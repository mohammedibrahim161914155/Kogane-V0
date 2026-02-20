import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AgentsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Agents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Agent management features will be available in the next update</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create and manage AI agents with custom personas, tools, and behaviors.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AgentEditor() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Agent</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Agent editor coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}