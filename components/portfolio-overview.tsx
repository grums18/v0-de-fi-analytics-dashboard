"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Sparkles, RefreshCw, ArrowLeft } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { TokenBalances } from "@/components/token-balances"
import { AIInsights } from "@/components/ai-insights"
import { AISummaryCard } from "@/components/ai-summary-card"
import { trackFeatureUsage } from "@/lib/analytics"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PortfolioOverviewProps {
  walletAddress: string
  onChangeWallet: () => void
}

export function PortfolioOverview({ walletAddress, onChangeWallet }: PortfolioOverviewProps) {
  const [selectedChain, setSelectedChain] = useState<"ethereum" | "solana">(
    walletAddress.startsWith("0x") ? "ethereum" : "solana",
  )

  const {
    data: portfolioData,
    error,
    mutate,
    isLoading,
  } = useSWR(`/api/portfolio/${walletAddress}?chain=${selectedChain}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const handleRefresh = () => {
    trackFeatureUsage("portfolio", "refresh", { chain: selectedChain })
    mutate()
  }

  const handleTabChange = (tab: string) => {
    trackFeatureUsage("portfolio", "tab_change", { tab })
  }

  const totalValue = portfolioData?.totalValue || 0
  const change24h = portfolioData?.change24h || 0
  const chains = portfolioData?.chains || [selectedChain]

  if (error || portfolioData?.error) {
    const errorMessage = error?.message || portfolioData?.error || "Failed to load portfolio data"
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onChangeWallet}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
            <p className="text-muted-foreground mt-1">Track your DeFi assets across multiple chains</p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{errorMessage}</p>
            {errorMessage.includes("not enabled") && (
              <div className="space-y-2">
                <p className="text-sm font-medium">To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Visit your Alchemy dashboard</li>
                  <li>Select your app</li>
                  <li>Go to the Networks tab</li>
                  <li>Enable ETH_MAINNET network</li>
                </ol>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => window.open("https://dashboard.alchemy.com", "_blank")}
                >
                  Open Alchemy Dashboard
                </Button>
              </div>
            )}
            <Button onClick={handleRefresh} variant="secondary" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onChangeWallet}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
            <p className="text-muted-foreground mt-1">Track your DeFi assets across multiple chains</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {change24h >= 0 ? (
                <TrendingUp className="h-3 w-3 text-accent" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={change24h >= 0 ? "text-accent" : "text-destructive"}>
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%
              </span>
              <span>vs 24h ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chains.length}</div>
            <div className="flex gap-1 mt-2">
              {chains.map((chain: string) => (
                <Badge key={chain} variant="secondary" className="text-xs">
                  {chain}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate">{walletAddress}</div>
            <p className="text-xs text-muted-foreground mt-1">Analyzing wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground mt-1">View AI-generated analysis</p>
          </CardContent>
        </Card>
      </div>

      {!isLoading && portfolioData && <AISummaryCard walletAddress={walletAddress} portfolioValue={totalValue} />}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Token Balances</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PortfolioChart />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <TokenBalances chain={selectedChain} walletAddress={walletAddress} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <AIInsights walletAddress={walletAddress} portfolioData={portfolioData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
