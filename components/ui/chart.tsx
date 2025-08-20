"use client"

import * as React from "react"

const ChartStyle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="rounded-md border bg-muted p-4" ref={ref} {...props} />,
)
ChartStyle.displayName = "ChartStyle"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="relative" ref={ref} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className="bg-popover text-popover-foreground shadow-md rounded-md p-2" ref={ref} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p className="text-sm" ref={ref} {...props} />,
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="flex items-center text-sm" ref={ref} {...props} />,
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="flex items-center mr-4 last:mr-0" ref={ref} {...props} />,
)
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartStyle, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div ref={ref} {...props} className={"relative" + (className ? " " + className : "")} />
})
Chart.displayName = "Chart"
export { Chart }
