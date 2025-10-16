"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function PortfolioChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Value History</CardTitle>
        <CardDescription>Your portfolio performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Historical Data Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Portfolio history tracking is not yet implemented. This feature will track your portfolio value over time
            once enabled.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
