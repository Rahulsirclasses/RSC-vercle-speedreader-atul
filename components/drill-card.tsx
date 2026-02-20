import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Eye, EyeOff, Lightbulb, MoveHorizontal, Rewind, Zap } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

interface DrillCardProps {
  title: string
  description: string
  time: string
  href: string
  icon: ReactNode | string
}

export function DrillCard({ title, description, time, href, icon }: DrillCardProps) {
  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }

    // Handle string icons for backward compatibility
    switch (icon) {
      case "zap":
        return <Zap className="h-5 w-5" />
      case "brain":
        return <Brain className="h-5 w-5" />
      case "eye":
        return <Eye className="h-5 w-5" />
      case "lightbulb":
        return <Lightbulb className="h-5 w-5" />
      case "rewind":
        return <Rewind className="h-5 w-5" />
      case "move-horizontal":
        return <MoveHorizontal className="h-5 w-5" />
      case "eye-off":
        return <EyeOff className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{getIcon()}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardDescription className="text-sm">{description}</CardDescription>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/20 p-2">
        <Button variant="ghost" size="sm">
          Learn More
        </Button>
        <Button size="sm" asChild>
          <Link href={href}>Start Drill</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
