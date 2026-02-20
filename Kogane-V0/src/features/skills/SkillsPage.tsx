import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SkillsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Skills</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Skill management features will be available in the next update</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create and share AI skills for specialized tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}