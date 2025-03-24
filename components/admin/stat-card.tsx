import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/components/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-xl border-0", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-3xl font-bold text-maroon-800">{value}</h3>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div className="mt-2 flex items-center">
                <span className={cn("text-xs font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
                  {trend.isPositive ? "+" : "-"}
                  {trend.value}%
                </span>
                <span className="ml-1 text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-maroon-100", iconClassName)}>
            <Icon className="h-8 w-8 text-maroon-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

