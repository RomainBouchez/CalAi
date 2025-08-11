"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {createContext} from "react";

// Create a context to manage tab state
const TabsContext = createContext<{
    value: string
    onValueChange: (value: string) => void
    selectedValue: string
}>({
    value: "",
    onValueChange: () => {},
    selectedValue: ""
})

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

// Root Tabs component
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
        const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "")

        const handleValueChange = (newValue: string) => {
            if (!value) {
                setSelectedValue(newValue)
            }
            onValueChange?.(newValue)
        }

        return (
            <TabsContext.Provider
                value={{
                    value: value || selectedValue,
                    onValueChange: handleValueChange,
                    selectedValue: value || selectedValue
                }}
            >
                <div ref={ref} className={className} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

// TabsList component
const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        role="tablist"
        {...props}
    />
))
TabsList.displayName = "TabsList"

// TabsTrigger component
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, ...props }, ref) => {
        const { selectedValue, onValueChange } = React.useContext(TabsContext)
        const isSelected = selectedValue === value

        return (
            <button
                ref={ref}
                role="tab"
                aria-selected={isSelected}
                data-state={isSelected ? "active" : "inactive"}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isSelected ? "bg-background text-foreground shadow-sm" : "",
                    className
                )}
                onClick={() => onValueChange(value)}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

// TabsContent component
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const { selectedValue } = React.useContext(TabsContext)
        const isSelected = selectedValue === value

        if (!isSelected) return null

        return (
            <div
                ref={ref}
                role="tabpanel"
                data-state={isSelected ? "active" : "inactive"}
                className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }