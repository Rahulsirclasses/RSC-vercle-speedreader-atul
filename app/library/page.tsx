"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Upload, BookOpen, FileText, Clock } from "lucide-react"
import { passages, getImportedPassages, addImportedPassage, type Passage } from "@/lib/passages"
import { ArticleCard } from "@/components/article-card"
import { useToast } from "@/hooks/use-toast"

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [importedPassages, setImportedPassages] = useState<Passage[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  // Load imported passages on component mount
  useEffect(() => {
    setImportedPassages(getImportedPassages())
  }, [])

  // Combine built-in and imported passages
  const allPassages = useMemo(() => {
    return [...passages, ...importedPassages]
  }, [importedPassages])

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    const cats = new Set(allPassages.map((p) => p.category))
    return Array.from(cats).sort()
  }, [allPassages])

  const difficulties = useMemo(() => {
    const diffs = new Set(allPassages.map((p) => p.difficulty))
    return Array.from(diffs).sort()
  }, [allPassages])

  // Filter passages based on search and filters
  const filteredPassages = useMemo(() => {
    return allPassages.filter((passage) => {
      const matchesSearch =
        passage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passage.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passage.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || passage.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || passage.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [allPassages, searchTerm, selectedCategory, selectedDifficulty])

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".txt")) {
      toast({
        title: "Invalid file type",
        description: "Please select a .txt file",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const text = await file.text()

      if (!text.trim()) {
        throw new Error("File is empty")
      }

      // Generate passage metadata
      const words = text.trim().split(/\s+/)
      const wordCount = words.length
      const estimatedMinutes = Math.ceil(wordCount / 250) // Average reading speed
      const estimatedTime = estimatedMinutes === 1 ? "1 min" : `${estimatedMinutes} min`

      // Generate excerpt (first 150 characters)
      const excerpt = text.length > 150 ? text.substring(0, 150) + "..." : text

      // Determine difficulty based on word count and sentence complexity
      let difficulty: "Easy" | "Medium" | "Hard" = "Medium"
      if (wordCount < 200) {
        difficulty = "Easy"
      } else if (wordCount > 500) {
        difficulty = "Hard"
      }

      const newPassage: Omit<Passage, "id"> = {
        title: file.name.replace(".txt", ""),
        content: text,
        excerpt,
        wordCount,
        estimatedTime,
        difficulty,
        category: "Imported",
      }

      // Add to imported passages
      addImportedPassage(newPassage)

      // Update local state
      setImportedPassages(getImportedPassages())

      toast({
        title: "Import successful",
        description: `"${newPassage.title}" has been added to your library`,
      })

      // Clear the file input
      event.target.value = ""
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const builtInPassages = passages
  const importedOnly = importedPassages

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reading Library</h1>
        <p className="text-muted-foreground">
          Choose from our curated collection of articles or import your own text to practice speed reading.
        </p>
      </div>

      {/* Search and Import */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileImport}
            className="hidden"
            id="file-import"
            disabled={isImporting}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-import")?.click()}
            disabled={isImporting}
            className="whitespace-nowrap"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import Text"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Difficulty:</span>
          <Button
            variant={selectedDifficulty === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDifficulty("all")}
          >
            All
          </Button>
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs for organizing content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Articles ({allPassages.length})</TabsTrigger>
          <TabsTrigger value="built-in">Built-in ({builtInPassages.length})</TabsTrigger>
          <TabsTrigger value="imported">Imported ({importedOnly.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredPassages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Try adjusting your search terms or filters, or import your own text files.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPassages.map((passage) => (
                <ArticleCard
                  key={passage.id}
                  id={passage.id}
                  title={passage.title}
                  excerpt={passage.excerpt}
                  wordCount={passage.wordCount}
                  estimatedTime={passage.estimatedTime}
                  difficulty={passage.difficulty}
                  category={passage.category}
                  content={passage.content}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="built-in" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {builtInPassages
              .filter((passage) => {
                const matchesSearch =
                  passage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  passage.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  passage.category.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesCategory = selectedCategory === "all" || passage.category === selectedCategory
                const matchesDifficulty = selectedDifficulty === "all" || passage.difficulty === selectedDifficulty
                return matchesSearch && matchesCategory && matchesDifficulty
              })
              .map((passage) => (
                <ArticleCard
                  key={passage.id}
                  id={passage.id}
                  title={passage.title}
                  excerpt={passage.excerpt}
                  wordCount={passage.wordCount}
                  estimatedTime={passage.estimatedTime}
                  difficulty={passage.difficulty}
                  category={passage.category}
                  content={passage.content}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="imported" className="mt-6">
          {importedOnly.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No imported articles</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Import your own text files to practice speed reading with personalized content.
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-import")?.click()}
                  disabled={isImporting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? "Importing..." : "Import Your First Text"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {importedOnly
                .filter((passage) => {
                  const matchesSearch =
                    passage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    passage.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    passage.category.toLowerCase().includes(searchTerm.toLowerCase())
                  const matchesCategory = selectedCategory === "all" || passage.category === selectedCategory
                  const matchesDifficulty = selectedDifficulty === "all" || passage.difficulty === selectedDifficulty
                  return matchesSearch && matchesCategory && matchesDifficulty
                })
                .map((passage) => (
                  <ArticleCard
                    key={passage.id}
                    id={passage.id}
                    title={passage.title}
                    excerpt={passage.excerpt}
                    wordCount={passage.wordCount}
                    estimatedTime={passage.estimatedTime}
                    difficulty={passage.difficulty}
                    category={passage.category}
                    content={passage.content}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPassages.length}</div>
            <p className="text-xs text-muted-foreground">
              {builtInPassages.length} built-in + {importedOnly.length} imported
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPassages.reduce((total, passage) => total + passage.wordCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(allPassages.reduce((total, passage) => total + passage.wordCount, 0) / 250)} min
            </div>
            <p className="text-xs text-muted-foreground">At 250 WPM average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
