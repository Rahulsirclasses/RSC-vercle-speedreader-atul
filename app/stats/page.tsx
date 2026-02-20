import { PerformanceChart } from "@/components/performance-chart"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Award,
  BarChart,
  Calendar,
  Clock,
  Target,
  Brain,
  Eye,
  Lightbulb,
  Rewind,
  MoveHorizontal,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getUserStats, getLeaderboard } from "@/lib/actions/stats"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const [userStats, leaderboard] = await Promise.all([
    getUserStats(session.user.id),
    getLeaderboard()
  ])

  const { overview, chartData, drillStats, recentTests } = userStats

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drills">Drills</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Average WPM" value={overview.avgWpm.toString()} change="" icon={<Clock className="h-4 w-4" />} />
            <StatsCard title="Comprehension" value={`${overview.avgComprehension}%`} change="" icon={<Target className="h-4 w-4" />} />
            <StatsCard title="Reading Streak" value={`${overview.streak} days`} change="" icon={<Calendar className="h-4 w-4" />} />
            <StatsCard title="Rank" value={overview.rank} change="" icon={<Award className="h-4 w-4" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Your reading speed over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={chartData as any} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Drill Performance</CardTitle>
                <CardDescription>Your average performance across recent drills (WPM)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium">Speed Sprint</span>
                    </div>
                    <span className="text-sm">{drillStats['speed-sprint']?.avgSpeed || 0} WPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Comprehension</span>
                    </div>
                    <span className="text-sm">{drillStats['comprehension-time']?.avgSpeed || 0} WPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Word Reveal</span>
                    </div>
                    <span className="text-sm">{drillStats['word-reveal']?.avgSpeed || 0} WPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium">Fixation Breaker</span>
                    </div>
                    <span className="text-sm">{drillStats['fixation-breaker']?.avgSpeed || 0} WPM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges Earned</CardTitle>
                <CardDescription>Your achievements and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${overview.avgWpm >= 500 ? '' : 'opacity-40'}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-center text-sm font-medium">Speed Demon</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${overview.streak >= 5 ? '' : 'opacity-40'}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-center text-sm font-medium">5-Day Streak</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${overview.avgComprehension >= 90 ? '' : 'opacity-40'}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-center text-sm font-medium">Accuracy Pro</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${overview.avgWpm >= 500 ? '' : 'opacity-40'}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <BarChart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-center text-sm font-medium">500 WPM Club</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Comprehension Tests</CardTitle>
                <CardDescription>Your last 5 comprehension assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium">Date</th>
                        <th className="pb-2 text-left font-medium">Passage/Drill</th>
                        <th className="pb-2 text-left font-medium">Speed</th>
                        <th className="pb-2 text-left font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentTests.length === 0 ? (
                        <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No recent tests found.</td></tr>
                      ) : recentTests.map((test: any) => (
                        <tr key={test.id}>
                          <td className="py-3">{test.date}</td>
                          <td className="py-3 capitalize">{test.passage.replace("-", " ")}</td>
                          <td className="py-3">{test.wpm} WPM</td>
                          <td className="py-3">
                            <span className={`font-medium ${test.score >= 80 ? 'text-green-600' : test.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {test.score}%
                            </span>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="drills" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Speed Sprint</CardTitle>
                    <CardDescription>Reading speed performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Best Speed</span>
                      <span className="text-sm font-medium">{drillStats['speed-sprint']?.bestSpeed || 0} WPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Average Speed</span>
                      <span className="text-sm font-medium">{drillStats['speed-sprint']?.avgSpeed || 0} WPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Sessions Completed</span>
                      <span className="text-sm font-medium">{drillStats['speed-sprint']?.sessions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Comprehension Time</CardTitle>
                    <CardDescription>Reading comprehension performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Average Score</span>
                      <span className="text-sm font-medium">{drillStats['comprehension-time']?.avgComprehension || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Average Speed</span>
                      <span className="text-sm font-medium">{drillStats['comprehension-time']?.avgSpeed || 0} WPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Sessions Completed</span>
                      <span className="text-sm font-medium">{drillStats['comprehension-time']?.sessions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Word Reveal</CardTitle>
                    <CardDescription>Visual processing performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Max Speed</span>
                      <span className="text-sm font-medium">{drillStats['word-reveal']?.bestSpeed || 0} WPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Sessions Completed</span>
                      <span className="text-sm font-medium">{drillStats['word-reveal']?.sessions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <MoveHorizontal className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Fixation Breaker</CardTitle>
                    <CardDescription>Eye movement performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Reading Speed</span>
                      <span className="text-sm font-medium">{drillStats['fixation-breaker']?.avgSpeed || 0} WPM</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Sessions Completed</span>
                      <span className="text-sm font-medium">{drillStats['fixation-breaker']?.sessions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Speed Readers</CardTitle>
                <CardDescription>Highest average reading speeds globally</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.topSpeedReaders.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No data available yet.</p>
                  ) : leaderboard.topSpeedReaders.map((user: any, index: number) => (
                    <div key={user.id} className={`flex items-center justify-between rounded-lg p-3 ${user.id === session.user.id ? 'bg-primary/10 border border-primary/20' : (index === 0 ? 'bg-primary/5' : '')}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-200 text-gray-800' : index === 2 ? 'bg-amber-100 text-amber-800' : 'bg-primary/10'}`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.id === session.user.id ? 'You' : (user.name || 'Anonymous')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{user.wpm} WPM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Comprehenders</CardTitle>
                <CardDescription>Highest average comprehension scores globally</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.topComprehenders.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No data available yet.</p>
                  ) : leaderboard.topComprehenders.map((user: any, index: number) => (
                    <div key={user.id} className={`flex items-center justify-between rounded-lg p-3 ${user.id === session.user.id ? 'bg-primary/10 border border-primary/20' : (index === 0 ? 'bg-primary/5' : '')}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-200 text-gray-800' : index === 2 ? 'bg-amber-100 text-amber-800' : 'bg-primary/10'}`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.id === session.user.id ? 'You' : (user.name || 'Anonymous')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{user.comprehension}%</div>
                        <div className="text-xs text-muted-foreground">{user.wpm} WPM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
