"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children?: React.ReactNode
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

// Simplified tooltip component
interface ChartTooltipProps {
  children?: React.ReactNode
  active?: boolean
  payload?: Record<string, unknown>[]
  className?: string
}

function ChartTooltip({ children, active, payload, className }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("bg-background border rounded-lg p-2 shadow-lg", className)}>
      {children}
    </div>
  )
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideIndicator = false,
  formatter,
  color,
  nameKey,
}: {
  active?: boolean
  payload?: Record<string, unknown>[]
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideIndicator?: boolean
  formatter?: (value: unknown, name: string, item: Record<string, unknown>, index: number, payload: Record<string, unknown>) => React.ReactNode
  color?: string
  nameKey?: string
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || (item.name as string) || (item.dataKey as string) || "value"}`
          const itemConfig = config[key as keyof typeof config]
          const indicatorColor = color || (item.color as string) || ((item.payload as Record<string, unknown>)?.fill as string)

          return (
            <div
              key={(item.dataKey as string) || index}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item?.value !== null && item.name ? (
                formatter(item.value, item.name as string, item, index, item.payload as Record<string, unknown>)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px]",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                          }
                        )}
                        style={{
                          backgroundColor: indicatorColor,
                          borderColor: indicatorColor,
                        }}
                      />
                    )
                  )}
                  <div className="flex flex-1 justify-between leading-none items-center">
                    <span className="text-muted-foreground">
                      {(itemConfig?.label as string) || (item.name as string)}
                    </span>
                    {item.value !== undefined && item.value !== null && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {(item.value as number).toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Simplified legend component
interface ChartLegendProps {
  children?: React.ReactNode
  payload?: Record<string, unknown>[]
  verticalAlign?: "top" | "bottom"
  className?: string
}

function ChartLegend({ children, payload, verticalAlign = "bottom", className }: ChartLegendProps) {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {children}
    </div>
  )
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: {
  className?: string
  hideIcon?: boolean
  payload?: Record<string, unknown>[]
  verticalAlign?: "top" | "bottom"
  nameKey?: string
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || (item.dataKey as string) || "value"}`
        const itemConfig = config[key as keyof typeof config]

        return (
          <div
            key={item.value as string}
            className="flex items-center gap-1.5"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color as string,
                }}
              />
            )}
            {itemConfig?.label as string}
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
