"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Loader2 } from "lucide-react"

interface AISummaryCardProps {
  walletAddress: string
  portfolioValue: number
}

export function AISummaryCard({ walletAddress, portfolioValue }: AISummaryCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<{
    healthScore: number
    sentiment: "bullish" | "neutral" | "bearish"
    keyInsights: string[]
    topRecommendation: string
  } | null>(null)

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          portfolioValue,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("[v0] Failed to generate AI summary:", error)
      // Fallback to basic summary on error
      setSummary({
        healthScore: 75,
        sentiment: "neutral",
        keyInsights: [
          "Unable to generate detailed insights at this time",
          "Portfolio value: $" + portfolioValue.toFixed(2),
          "Please try again later",
        ],
        topRecommendation: "Check your wallet connection and try again",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-accent"
      case "bearish":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "default"
      case "bearish":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Portfolio Summary
          </CardTitle>
          {!isGenerating && summary && (
            <Badge variant={getSentimentBadgeVariant(summary.sentiment)} className="gap-1 capitalize">
              <TrendingUp className="h-3 w-3" />
              {summary.sentiment}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing your portfolio...</span>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Health Score */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Health Score</p>
                <p className="text-2xl font-bold">{summary.healthScore}/100</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{summary.healthScore}</span>
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Insights
              </p>
              <div className="space-y-2">
                {summary.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recommendation */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Top Recommendation
              </p>
              <p className="text-sm text-muted-foreground">{summary.topRecommendation}</p>
            </div>

            {/* Action Button */}
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={generateSummary}>
              <Sparkles className="h-4 w-4" />
              Regenerate Summary
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Generate AI Summary</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Get instant AI-powered insights about your portfolio health, risks, and opportunities.
            </p>
            <Button onClick={generateSummary} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
