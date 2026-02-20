import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Dumbbell } from "lucide-react"
import Link from "next/link"

export function UpcomingDrills() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Drills</CardTitle>
          <CardDescription>Your scheduled reading exercises</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/drills">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Speed Sprint</p>
                <p className="text-sm text-muted-foreground">Read 300-500 words at target WPM</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>3 mins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Comprehension Under Time</p>
                <p className="text-sm text-muted-foreground">Timed reading + 5 MCQs</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tomorrow</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>5 mins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Fixation Breaker</p>
                <p className="text-sm text-muted-foreground">Read staggered columns</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Wed, May 8</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>3 mins</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
