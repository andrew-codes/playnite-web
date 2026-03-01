'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationRouter {
  back: () => void
  push: (path: string) => void
}

const NavigationRouterContext = createContext<NavigationRouter | null>(null)

export const NavigationRouterProvider = ({
  children,
  router,
}: {
  children: ReactNode
  router?: NavigationRouter
}) => {
  // If no router is provided, use Next.js router (standard view)
  const nextRouter = useRouter()
  const defaultRouter: NavigationRouter = {
    back: () => nextRouter.back(),
    push: (path: string) => nextRouter.push(path),
  }

  return (
    <NavigationRouterContext.Provider value={router || defaultRouter}>
      {children}
    </NavigationRouterContext.Provider>
  )
}

export const useNavigationRouter = (): NavigationRouter => {
  const router = useContext(NavigationRouterContext)
  
  // Fallback to Next.js router if no context is provided
  const nextRouter = useRouter()
  
  if (!router) {
    return {
      back: () => nextRouter.back(),
      push: (path: string) => nextRouter.push(path),
    }
  }
  
  return router
}