"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Shield, FileText, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { getPassages, createPassage, updatePassage, deletePassage } from "@/lib/actions/content"

// Define interface for Passage
interface PassageData {
    _id?: string
    title: string
    content: string
    excerpt: string
    wordCount: number
    estimatedTime: string
    difficulty: "Easy" | "Medium" | "Hard"
    category: string
    createdAt?: string
}

export default function AdminContentPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    const [passages, setPassages] = useState<PassageData[]>([])
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<PassageData>({
        title: "",
        content: "",
        excerpt: "",
        wordCount: 0,
        estimatedTime: "1 min",
        difficulty: "Medium",
        category: "General"
    })

    // Guard: redirect non-admins
    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
        }
    }, [user, loading, router])

    const fetchAllPassages = useCallback(async () => {
        setFetching(true)
        setError(null)
        try {
            const data = await getPassages()
            setPassages(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        if (user?.role === "admin") fetchAllPassages()
    }, [user, fetchAllPassages])

    const calculateStats = (content: string) => {
        const words = content.trim().split(/\s+/).filter(w => w.length > 0)
        const wCount = words.length
        const mins = Math.max(1, Math.ceil(wCount / 200)) // Assuming 200 WPM
        return { wordCount: wCount, estimatedTime: `${mins} min` }
    }

    const handleContentChange = (content: string) => {
        const { wordCount, estimatedTime } = calculateStats(content)
        setFormData(prev => ({ ...prev, content, wordCount, estimatedTime }))
    }

    const openCreateDialog = () => {
        setEditingId(null)
        setFormData({
            title: "",
            content: "",
            excerpt: "",
            wordCount: 0,
            estimatedTime: "1 min",
            difficulty: "Medium",
            category: "General"
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (passage: PassageData) => {
        setEditingId(passage._id || null)
        setFormData(passage)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            setError("Title and Content are required")
            return
        }

        setSaving(true)
        setError(null)

        try {
            if (editingId) {
                const res = await updatePassage(editingId, formData)
                if (!res.success) throw new Error(res.error)
            } else {
                const res = await createPassage(formData)
                if (!res.success) throw new Error(res.error)
            }
            setIsDialogOpen(false)
            await fetchAllPassages()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this passage?")) return

        try {
            const res = await deletePassage(id)
            if (!res.success) throw new Error(res.error)
            await fetchAllPassages()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const getDifficultyBadge = (diff: string) => {
        switch (diff) {
            case "Easy": return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-normal">Easy</Badge>
            case "Medium": return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-normal">Medium</Badge>
            case "Hard": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-normal">Hard</Badge>
            default: return <Badge variant="outline">{diff}</Badge>
        }
    }

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
                        Content Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage reading passages, drills, and categories.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAllPassages}
                        disabled={fetching}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                                <Plus className="h-4 w-4" /> Add Passage
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-border/50 bg-background/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Passage" : "Create New Passage"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {error && (
                                    <div className="p-3 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                                        {error}
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Title</Label>
                                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Category</Label>
                                    <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="difficulty" className="text-right">Difficulty</Label>
                                    <Select value={formData.difficulty} onValueChange={(val: any) => setFormData({ ...formData, difficulty: val })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="excerpt" className="text-right">Excerpt</Label>
                                    <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="col-span-3" rows={2} />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="content" className="text-right mt-3">Content (Text)</Label>
                                    <div className="col-span-3 mb-2 space-y-2">
                                        <Textarea
                                            id="content"
                                            value={formData.content}
                                            onChange={(e) => handleContentChange(e.target.value)}
                                            className="min-h-[200px]"
                                        />
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>Words: {formData.wordCount}</span>
                                            <span>Est. Time: {formData.estimatedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
                                <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingId ? "Save Changes" : "Create"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Passages Table */}
            <Card className="bg-background/50 border-border/50 backdrop-blur shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Library Passages
                        <Badge variant="secondary" className="ml-2 font-normal text-xs">{passages.length} Total</Badge>
                    </CardTitle>
                    <CardDescription>Content library used for drills and reader sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {fetching ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-3 text-muted-foreground">Loading passages...</span>
                        </div>
                    ) : passages.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No passages found</p>
                            <p className="text-sm mt-1">Click Add Passage to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                                        <th className="text-left pb-3 pr-4 font-semibold">Title & Excerpt</th>
                                        <th className="text-left pb-3 pr-4 font-semibold">Category</th>
                                        <th className="text-left pb-3 pr-4 font-semibold">Stats</th>
                                        <th className="text-left pb-3 pr-4 font-semibold">Difficulty</th>
                                        <th className="text-right pb-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {passages.map((p) => (
                                        <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pr-4">
                                                <div>
                                                    <p className="font-semibold text-base line-clamp-1">{p.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {p.category}
                                                </Badge>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                                                    <span>{p.wordCount} words</span>
                                                    <span className="opacity-40">•</span>
                                                    <span>{p.estimatedTime}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">{getDifficultyBadge(p.difficulty)}</td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                                        onClick={() => openEditDialog(p)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                        onClick={() => p._id && handleDelete(p._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
