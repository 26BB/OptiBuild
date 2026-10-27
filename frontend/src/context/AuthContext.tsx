"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getApiUrl } from "@/lib/api"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export interface ProjectSummary {
  id: string
  name: string
  status: string
  rera_registration_no?: string
  promoter_name?: string
  proposed_completion_date?: string
  built_up_area_sqft?: number
  number_of_floors?: number
  total_project_cost?: number
  delay_days?: number
  has_wbs?: boolean
  has_schedule?: boolean
  has_optimizer?: boolean
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  activeProjectId: string | null
  activeProject: ProjectSummary | null
  projects: ProjectSummary[]
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setActiveProjectId: (id: string) => void
  refreshProjects: () => Promise<void>
  hasPermission: (allowedRoles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const ROLE_HOMES: Record<string, string> = {
  admin: "/admin",
  project_manager: "/",
  site_engineer: "/materials",
  store_keeper: "/materials",
  architect: "/drawings",
  accountant: "/dashboard",
  owner: "/dashboard",
}

function setAuthCookies(tokenVal: string, roleVal?: string) {
  if (typeof document !== "undefined") {
    document.cookie = `optibuild_token=${tokenVal}; path=/; max-age=86400; SameSite=Lax`
    document.cookie = `auth_token=${tokenVal}; path=/; max-age=86400; SameSite=Lax`
    if (roleVal) {
      document.cookie = `optibuild_role=${roleVal}; path=/; max-age=86400; SameSite=Lax`
    }
  }
}

function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "optibuild_token=; path=/; max-age=0"
    document.cookie = "auth_token=; path=/; max-age=0"
    document.cookie = "optibuild_role=; path=/; max-age=0"
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  // Initial authentication hydration
  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedToken = localStorage.getItem("optibuild_token")
        const storedUser = localStorage.getItem("optibuild_user")
        const storedProjectId = localStorage.getItem("optibuild_active_project_id")

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(parsedUser)
          setAuthCookies(storedToken, parsedUser.role)
          if (storedProjectId) {
            setActiveProjectIdState(storedProjectId)
          }

          // Verify with /auth/me
          const res = await fetch(getApiUrl("/api/v1/auth/me"), {
            headers: { Authorization: `Bearer ${storedToken}` },
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            setAuthCookies(storedToken, data.user.role)
            localStorage.setItem("optibuild_user", JSON.stringify(data.user))
            if (data.projects && Array.isArray(data.projects)) {
              setProjects(data.projects)
              if (!storedProjectId && data.projects.length > 0) {
                setActiveProjectIdState(data.projects[0].id)
                localStorage.setItem("optibuild_active_project_id", data.projects[0].id)
              }
            }
          } else {
            // Token expired or invalid
            localStorage.removeItem("optibuild_token")
            localStorage.removeItem("optibuild_user")
            clearAuthCookies()
            setToken(null)
            setUser(null)
          }
        } else {
          clearAuthCookies()
        }
      } catch (err) {
        console.error("Auth hydration error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    hydrate()
  }, [])

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user && pathname === "/login") {
        const home = ROLE_HOMES[user.role] || "/"
        router.push(home)
      }
    }
  }, [user, isLoading, pathname, router])

  const refreshProjects = async () => {
    if (!token) return
    try {
      const res = await fetch(getApiUrl("/api/v1/projects"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        if (data.length > 0 && (!activeProjectId || !data.some((p: ProjectSummary) => p.id === activeProjectId))) {
          setActiveProjectIdState(data[0].id)
          localStorage.setItem("optibuild_active_project_id", data[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    }
  }

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id)
    localStorage.setItem("optibuild_active_project_id", id)
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        return { success: false, error: errData.detail || "Invalid email or password." }
      }

      const data = await res.json()
      setToken(data.access_token)
      setUser(data.user)
      setAuthCookies(data.access_token, data.user.role)

      localStorage.setItem("optibuild_token", data.access_token)
      localStorage.setItem("optibuild_user", JSON.stringify(data.user))

      // Fetch projects
      const projRes = await fetch(getApiUrl("/api/v1/projects"), {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (projRes.ok) {
        const projData = await projRes.json()
        setProjects(projData)
        if (projData.length > 0) {
          setActiveProjectIdState(projData[0].id)
          localStorage.setItem("optibuild_active_project_id", projData[0].id)
        }
      }

      const home = ROLE_HOMES[data.user.role] || "/"
      router.push(home)

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch(getApiUrl("/api/v1/auth/logout"), { method: "POST" })
    } catch {}
    localStorage.removeItem("optibuild_token")
    localStorage.removeItem("optibuild_user")
    localStorage.removeItem("optibuild_active_project_id")
    clearAuthCookies()
    setToken(null)
    setUser(null)
    setProjects([])
    setActiveProjectIdState(null)
    router.push("/login")
  }

  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false
    if (user.role === "admin") return true
    return allowedRoles.includes(user.role)
  }

  const activeProject = projects.find((p) => p.id === activeProjectId) || null

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeProjectId,
        activeProject,
        projects,
        login,
        logout,
        setActiveProjectId,
        refreshProjects,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
