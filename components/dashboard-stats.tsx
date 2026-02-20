import { Award, BookOpen, Clock, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Speed</p>
            <h3 className="text-2xl font-bold">342 WPM</h3>
            <p className="text-xs text-green-600">+12% from last week</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Comprehension</p>
            <h3 className="text-2xl font-bold">87%</h3>
            <p className="text-xs text-green-600">+3% from last week</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reading Streak</p>
            <h3 className="text-2xl font-bold">5 days</h3>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
            <h3 className="text-2xl font-bold">Top 15%</h3>
            <p className="text-xs text-green-600">+5% from last month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
