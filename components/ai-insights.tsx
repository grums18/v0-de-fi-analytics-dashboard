"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface AIInsightsProps {
  walletAddress: string
  portfolioData?: any
}

export function AIInsights({ walletAddress, portfolioData }: AIInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)

  const generateInsights = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          portfolioData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error("[v0] Failed to generate AI insights:", error)
      setInsights("Failed to generate insights. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Portfolio Analysis
            </CardTitle>
            <CardDescription>Get personalized insights and recommendations powered by AI</CardDescription>
          </div>
          <Button onClick={generateInsights} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{insights}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No insights generated yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Click the "Generate Insights" button to get AI-powered analysis of your portfolio, including risk
              assessment, opportunities, and personalized recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
