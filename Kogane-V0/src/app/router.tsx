import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { AppShell } from '@/app/layout/AppShell'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

const ChatPage = lazy(() => import('@/features/chat/ChatPage').then(m => ({ default: m.ChatPage })))
const AgentsPage = lazy(() => import('@/features/agents/AgentsPage').then(m => ({ default: m.AgentsPage })))
const AgentEditor = lazy(() => import('@/features/agents/AgentEditor').then(m => ({ default: m.AgentEditor })))
const SkillsPage = lazy(() => import('@/features/skills/SkillsPage').then(m => ({ default: m.SkillsPage })))
const PersonasPage = lazy(() => import('@/features/personas/PersonasPage').then(m => ({ default: m.PersonasPage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'chat/:conversationId?',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'agents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentsPage />
          </Suspense>
        ),
      },
      {
        path: 'agents/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentEditor />
          </Suspense>
        ),
      },
      {
        path: 'agents/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentEditor />
          </Suspense>
        ),
      },
      {
        path: 'skills',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SkillsPage />
          </Suspense>
        ),
      },
      {
        path: 'personas',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PersonasPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}