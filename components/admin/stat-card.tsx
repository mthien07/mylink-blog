import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type StatCardColor = 'blue' | 'green' | 'orange' | 'purple' | 'default'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: string
  color?: StatCardColor
}

const colorMap: Record<StatCardColor, { icon: string; bg: string }> = {
  blue:    { icon: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40' },
  green:   { icon: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/40' },
  orange:  { icon: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  purple:  { icon: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  default: { icon: 'text-muted-foreground', bg: 'bg-muted/50' },
}

export function StatCard({ title, value, description, icon: Icon, trend, color = 'default' }: StatCardProps) {
  const c = colorMap[color]
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('p-1.5 rounded-md', c.bg)}>
          <Icon className={cn('h-4 w-4', c.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
}
