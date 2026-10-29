"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, type Variants } from "framer-motion"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { PermissionDenied } from "@/components/ui/PermissionDenied"
import { useAuth, UserProfile } from "@/context/AuthContext"
import { Counter } from "@/components/ui/Counter"
import { Badge } from "@/components/ui/badge"
import { SharedTooltipAvatars, TeamMemberAvatar } from "@/components/ui/SharedTooltipAvatars"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Users,
  UserPlus,
  Shield,
  FolderKanban,
  UserCheck,
  AlertTriangle,
  Loader2,
  Search,
  Plus,
  CheckCircle2,
} from "lucide-react"

interface ProjectMemberInfo {
  id: string
  user_id: string
  user_email?: string
  user_name?: string
  role: string
}

const ROLES = [
  { value: "admin", label: "Admin (Full Access & User Mgmt)" },
  { value: "project_manager", label: "Project Manager (RERA, WBS, Schedules, Crashing)" },
  { value: "site_engineer", label: "Site Engineer (Task Progress & Site Photos)" },
  { value: "store_keeper", label: "Store Keeper (Materials & Bill Photos)" },
  { value: "architect", label: "Architect (View-Only Drawing Attachments)" },
  { value: "accountant", label: "Accountant (Budget vs Actual & Spend Audit)" },
  { value: "owner", label: "Owner (Read-Only Risk & Penalty Dashboard)" },
]

const ROLE_BADGE_STYLES: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-primary/10 border-primary/30 text-primary font-bold",
  },
  project_manager: {
    label: "Project Manager",
    className: "bg-primary/10 border-primary/30 text-primary font-bold",
  },
  site_engineer: {
    label: "Site Engineer",
    className: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 font-bold",
  },
  store_keeper: {
    label: "Store Keeper",
    className: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold",
  },
  architect: {
    label: "Architect",
    className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold",
  },
  accountant: {
    label: "Accountant",
    className: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold",
  },
  owner: {
    label: "Owner",
    className: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold",
  },
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export default function AdminPage() {
  const { user, token, projects, activeProjectId, hasPermission, refreshProjects } = useAuth()

  const [usersList, setUsersList] = useState<UserProfile[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || "")
  const [projectMembers, setProjectMembers] = useState<ProjectMemberInfo[]>([])

  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false)
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false)
  const [isAssigningMember, setIsAssigningMember] = useState<boolean>(false)

  // Dialog & Sheet State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState<boolean>(false)
  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState<boolean>(false)
  const [userSearchQuery, setUserSearchQuery] = useState<string>("")

  // New user form state
  const [newName, setNewName] = useState<string>("")
  const [newEmail, setNewEmail] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [newRole, setNewRole] = useState<string>("site_engineer")

  // Assign member form state
  const [assignUserId, setAssignUserId] = useState<string>("")
  const [assignRole, setAssignRole] = useState<string>("site_engineer")

  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch all users
  const fetchUsers = async () => {
    if (!token) return
    setIsLoadingUsers(true)
    setError(null)
    try {
      const res = await fetch(getApiUrl("/api/v1/users"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error("Failed to load user roster.")
      }
      const data = await res.json()
      setUsersList(data || [])
      if (data.length > 0 && !assignUserId) {
        setAssignUserId(data[0].id)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load users.")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Fetch members for selected project
  const fetchProjectMembers = async (projId: string) => {
    if (!token || !projId) {
      setProjectMembers([])
      return
    }
    setIsLoadingMembers(true)
    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${projId}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProjectMembers(data.members || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingMembers(false)
    }
  }

  useEffect(() => {
    if (token && hasPermission(["admin", "project_manager"])) {
      fetchUsers()
    }
  }, [token])

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectMembers(selectedProjectId)
    } else if (projects.length > 0) {
      setSelectedProjectId(projects[0].id)
      fetchProjectMembers(projects[0].id)
    }
  }, [selectedProjectId, projects])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newEmail.trim() || !newPassword) return

    setIsCreatingUser(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(getApiUrl("/api/v1/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to create user.")
      }

      const created = await res.json()
      setSuccessMsg(`User ${created.full_name} (${created.email}) created successfully with role ${created.role}.`)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setIsUserDialogOpen(false)
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create user.")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selectedProjectId || !assignUserId) return

    setIsAssigningMember(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${selectedProjectId}/members`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: assignUserId,
          role: assignRole,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to assign project member.")
      }

      const resp = await res.json()
      setSuccessMsg(resp.message || "Project membership updated.")
      setIsAssignSheetOpen(false)
      fetchProjectMembers(selectedProjectId)
      refreshProjects()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to assign project member.")
    } finally {
      setIsAssigningMember(false)
    }
  }

  // Filtered user list
  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.toLowerCase().trim()
    if (!q) return usersList
    return usersList.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [usersList, userSearchQuery])

  // Map project members to avatars
  const avatarMembers: TeamMemberAvatar[] = useMemo(() => {
    return projectMembers.map((m) => ({
      id: m.id || m.user_id,
      name: m.user_name || "Team Member",
      role: m.role,
      roleTitle: m.role.replace("_", " ").toUpperCase(),
    }))
  }, [projectMembers])

  // Access check
  if (!hasPermission(["admin", "project_manager"])) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Administration" />
        <main className="p-6">
          <PermissionDenied
            title="Administrator / Manager Access Required"
            description="Only Administrators and Project Managers can manage users and assign project team roles."
            requiredRoles={["admin", "project_manager"]}
          />
        </main>
      </div>
    )
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar projectName="User & Organization Administration" delayRiskDays={0} />

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Admin Overview Header Card */}
        <div className="border border-border bg-card p-4 rounded-[4px] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                  OptiBuild Security & Role Access Control
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                Manage organization credentials, 7-role RBAC permissions, and project team assignments.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-mono px-2.5 py-1 bg-secondary border border-border text-foreground rounded-[4px]">
                Organization: OptiBuild Infrastructure Corp
              </span>

              {hasPermission(["admin"]) && (
                <button
                  type="button"
                  onClick={() => setIsUserDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>REGISTER USER</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive text-destructive font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-status-success/10 border border-status-success text-status-success font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Administration KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Registered Accounts
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              <Counter value={usersList.length} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Active enterprise users
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Managed Projects
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              <Counter value={projects.length} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              MahaRERA projects active
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Selected Project Team
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              <Counter value={projectMembers.length} suffix=" Members" />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Assigned to {selectedProject?.name || "Project"}
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              RBAC Role Architecture
            </div>
            <div className="text-2xl font-bold font-mono text-status-success mt-1">
              7 Roles
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Strict granular access rules
            </div>
          </div>
        </div>

        {/* User Roster Table Section */}
        <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                REGISTERED USER ROSTER ({usersList.length})
              </h3>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, role..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border pl-8 pr-3 py-1.5 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="flex flex-col items-center justify-center p-16 font-mono text-xs text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
              <span>Loading organizational roster...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase">
                    <th className="p-3 font-semibold">Full Name</th>
                    <th className="p-3 font-semibold">Email Address</th>
                    <th className="p-3 font-semibold">Global System Role</th>
                    <th className="p-3 font-semibold">Account Status</th>
                    <th className="p-3 font-semibold text-right">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground font-mono">
                        No users match query &apos;{userSearchQuery}&apos;.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const roleConfig = ROLE_BADGE_STYLES[u.role] || {
                        label: u.role,
                        className: "bg-secondary border-border text-foreground",
                      }
                      return (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-sans font-semibold text-foreground">{u.full_name}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${roleConfig.className}`}
                            >
                              {roleConfig.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-status-success/15 border border-status-success/30 text-status-success font-medium rounded-[3px]">
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right text-muted-foreground font-mono text-[11px]">
                            {u.role === "admin" ? "Superuser" : "Standard"}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Project Membership Assignment Section */}
        <div className="border border-border bg-card p-5 rounded-[4px] space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                  Project Team Role Assignments
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                Assign enterprise users to specific projects with project-scoped roles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {projects.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-medium">Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="text-xs font-mono bg-background border border-border p-1.5 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAssignSheetOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border text-foreground hover:bg-secondary/80 font-mono text-xs font-medium transition-colors rounded-[4px] shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ASSIGN MEMBER</span>
                </button>
              )}
            </div>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground py-6 text-center">
              No projects created yet. Upload a MahaRERA PDF first to create a project before assigning members.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Project Members Table Header with Avatars */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20 p-3 rounded-[4px] border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-foreground">
                    {selectedProject?.name || "Selected Project"}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ({projectMembers.length} Active Members)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Team Preview:</span>
                  <SharedTooltipAvatars members={avatarMembers} maxVisible={6} size="sm" />
                </div>
              </div>

              {/* Members Table */}
              {isLoadingMembers ? (
                <div className="flex items-center justify-center p-8 font-mono text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                  <span>Loading project members...</span>
                </div>
              ) : projectMembers.length === 0 ? (
                <div className="p-8 border border-dashed border-border text-center text-xs font-mono text-muted-foreground rounded-[4px]">
                  No team members assigned to {selectedProject?.name} yet. Click &quot;Assign Member&quot; to add team staff.
                </div>
              ) : (
                <div className="border border-border rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase">
                        <th className="p-3 font-semibold">Team Member</th>
                        <th className="p-3 font-semibold">Email Address</th>
                        <th className="p-3 font-semibold">Assigned Project Role</th>
                        <th className="p-3 font-semibold text-right">Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {projectMembers.map((m) => {
                        const roleStyle = ROLE_BADGE_STYLES[m.role] || {
                          label: m.role,
                          className: "bg-secondary border-border text-foreground",
                        }
                        return (
                          <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-sans font-medium text-foreground">{m.user_name || "—"}</td>
                            <td className="p-3 text-muted-foreground">{m.user_email || "—"}</td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${roleStyle.className}`}
                              >
                                {roleStyle.label}
                              </Badge>
                            </td>
                            <td className="p-3 text-right text-muted-foreground font-mono text-[11px]">
                              Project-Scoped
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Register User Dialog (Admin Only) */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span>Register New System User</span>
              </DialogTitle>
              <DialogDescription>
                Create a new enterprise account with predefined global RBAC role permissions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-3.5 py-2 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@optibuild.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Global System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isCreatingUser || !newName.trim() || !newEmail.trim() || !newPassword}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create User Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign Member Sheet */}
        <Sheet open={isAssignSheetOpen} onOpenChange={setIsAssignSheetOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Assign Member to {selectedProject?.name}</SheetTitle>
              <SheetDescription>
                Assign an existing enterprise account to this project with project-scoped authorization.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleAssignMember} className="space-y-4 py-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Select Enterprise User</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Assigned Project Role</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <SheetFooter className="pt-4">
                <button
                  type="submit"
                  disabled={isAssigningMember || !selectedProjectId || !assignUserId}
                  className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isAssigningMember ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Assigning Member...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm Project Assignment</span>
                    </>
                  )}
                </button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </motion.main>
    </div>
  )
}
