import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="api" className="w-full">
        <TabsList>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for different providers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">API key management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Preferences</CardTitle>
              <CardDescription>Configure default models and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Model settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Appearance settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Configure voice input and output</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Voice settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}