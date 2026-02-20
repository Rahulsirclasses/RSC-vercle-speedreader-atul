"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Users, CheckCircle, XCircle, UserCog, RefreshCw } from "lucide-react"

interface AdminUser {
    _id: string
    name: string
    email: string
    provider: "credentials" | "google"
    role: "user" | "admin"
    status: "pending" | "active" | "disabled"
    createdAt: string
    lastLogin?: string
}

export default function AdminUsersPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    const [users, setUsers] = useState<AdminUser[]>([])
    const [fetching, setFetching] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Guard: redirect non-admins
    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
        }
    }, [user, loading, router])

    const fetchUsers = useCallback(async () => {
        setFetching(true)
        setError(null)
        try {
            const res = await fetch("/api/admin/users")
            if (!res.ok) throw new Error("Failed to load users")
            const data = await res.json()
            setUsers(data.users)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        if (user?.role === "admin") fetchUsers()
    }, [user, fetchUsers])

    const callAction = async (userId: string, action: string) => {
        setActionLoading(userId + action)
        try {
            const res = await fetch(`/api/admin/users/${userId}/${action}`, { method: "PATCH" })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error || "Action failed")
            }
            await fetchUsers()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const isActioning = (userId: string, action: string) =>
        actionLoading === userId + action

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
            case "pending":
                return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20">Pending</Badge>
            case "disabled":
                return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/20">Disabled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getRoleBadge = (role: string) => {
        if (role === "admin") {
            return <Badge className="bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
        }
        return <Badge variant="outline" className="text-muted-foreground">User</Badge>
    }

    const getProviderBadge = (provider: string) => {
        if (provider === "google") {
            return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20">Google</Badge>
        }
        return <Badge variant="outline" className="text-muted-foreground">Email</Badge>
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        })

    // Stats
    const totalUsers = users.length
    const pendingCount = users.filter((u) => u.status === "pending").length
    const activeCount = users.filter((u) => u.status === "active").length
    const disabledCount = users.filter((u) => u.status === "disabled").length

    if (loading || (!user && !loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user || user.role !== "admin") return null

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-500/20">
                            <Shield className="h-7 w-7 text-violet-400" />
                        </div>
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage user approvals and access control</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={fetching}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Users", value: totalUsers, icon: Users, color: "blue" },
                    { label: "Pending", value: pendingCount, icon: Loader2, color: "amber" },
                    { label: "Active", value: activeCount, icon: CheckCircle, color: "emerald" },
                    { label: "Disabled", value: disabledCount, icon: XCircle, color: "red" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="bg-background/50 border-border/50 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                    <p className="text-3xl font-bold">{value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                                    <Icon className={`h-5 w-5 text-${color}-400`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <Card className="bg-background/50 border-border/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-muted-foreground" />
                        All Users
                    </CardTitle>
                    <CardDescription>Approve pending users and manage account access</CardDescription>
                </CardHeader>
                <CardContent>
                    {fetching ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-3 text-muted-foreground">Loading users...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No users found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 text-muted-foreground">
                                        <th className="text-left pb-3 pr-4 font-medium">User</th>
                                        <th className="text-left pb-3 pr-4 font-medium">Provider</th>
                                        <th className="text-left pb-3 pr-4 font-medium">Status</th>
                                        <th className="text-left pb-3 pr-4 font-medium">Role</th>
                                        <th className="text-left pb-3 pr-4 font-medium">Joined</th>
                                        <th className="text-left pb-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4 pr-4">
                                                <div>
                                                    <p className="font-medium">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">{getProviderBadge(u.provider)}</td>
                                            <td className="py-4 pr-4">{getStatusBadge(u.status)}</td>
                                            <td className="py-4 pr-4">{getRoleBadge(u.role)}</td>
                                            <td className="py-4 pr-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {u.status === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs gap-1"
                                                            onClick={() => callAction(u._id, "approve")}
                                                            disabled={!!actionLoading}
                                                        >
                                                            {isActioning(u._id, "approve") ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-3 w-3" />
                                                            )}
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {u.status === "active" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs gap-1"
                                                            onClick={() => callAction(u._id, "disable")}
                                                            disabled={!!actionLoading || u._id === user.id}
                                                        >
                                                            {isActioning(u._id, "disable") ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3" />
                                                            )}
                                                            Disable
                                                        </Button>
                                                    )}
                                                    {u.status === "disabled" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs gap-1"
                                                            onClick={() => callAction(u._id, "enable")}
                                                            disabled={!!actionLoading}
                                                        >
                                                            {isActioning(u._id, "enable") ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-3 w-3" />
                                                            )}
                                                            Enable
                                                        </Button>
                                                    )}
                                                    {u.role === "user" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 h-7 text-xs gap-1"
                                                            onClick={() => callAction(u._id, "make-admin")}
                                                            disabled={!!actionLoading}
                                                        >
                                                            {isActioning(u._id, "make-admin") ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Shield className="h-3 w-3" />
                                                            )}
                                                            Make Admin
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
