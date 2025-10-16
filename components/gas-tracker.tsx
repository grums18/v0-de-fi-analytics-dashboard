"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fuel, Clock, Zap, Timer, RefreshCw, Bell, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Common transaction types with estimated gas usage
const transactionTypes = [
  { name: "Simple Transfer", gasUnits: 21000 },
  { name: "ERC-20 Transfer", gasUnits: 65000 },
  { name: "Uniswap Swap", gasUnits: 150000 },
  { name: "NFT Mint", gasUnits: 100000 },
  { name: "Contract Deploy", gasUnits: 500000 },
]

export function GasTracker() {
  const [selectedChain, setSelectedChain] = useState<"ethereum" | "solana">("ethereum")
  const [alertsEnabled, setAlertsEnabled] = useState(false)

  const {
    data: gasData,
    error,
    mutate,
    isLoading,
  } = useSWR(`/api/gas/${selectedChain}`, fetcher, {
    refreshInterval: 15000, // Refresh every 15 seconds
  })

  const handleRefresh = () => {
    mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gas Fee Tracker</h1>
            <p className="text-muted-foreground mt-1">Monitor real-time gas prices across chains</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading gas prices...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !gasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gas Fee Tracker</h1>
            <p className="text-muted-foreground mt-1">Monitor real-time gas prices across chains</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="font-semibold mb-2">Failed to Load Gas Prices</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Unable to fetch gas price data. Please check your API keys and try again.
              </p>
              <Button onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gas Fee Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor real-time gas prices across chains</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={alertsEnabled ? "default" : "outline"}
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            {alertsEnabled ? "Alerts On" : "Enable Alerts"}
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Chain Tabs */}
      <Tabs value={selectedChain} onValueChange={(v) => setSelectedChain(v as typeof selectedChain)}>
        <TabsList>
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedChain} className="space-y-6 mt-6">
          {/* Current Gas Prices */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Slow */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Slow</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedChain === "ethereum"
                    ? `${gasData?.slow?.gwei || 0} Gwei`
                    : `${gasData?.slow?.lamports?.toLocaleString() || 0} Lamports`}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">${gasData?.slow?.usd?.toFixed(3) || 0}</span>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {gasData?.slow?.time || "~5 min"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Standard */}
            <Card className="border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Standard</CardTitle>
                <Fuel className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedChain === "ethereum"
                    ? `${gasData?.standard?.gwei || 0} Gwei`
                    : `${gasData?.standard?.lamports?.toLocaleString() || 0} Lamports`}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">${gasData?.standard?.usd?.toFixed(3) || 0}</span>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {gasData?.standard?.time || "~2 min"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Fast */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fast</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedChain === "ethereum"
                    ? `${gasData?.fast?.gwei || 0} Gwei`
                    : `${gasData?.fast?.lamports?.toLocaleString() || 0} Lamports`}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">${gasData?.fast?.usd?.toFixed(3) || 0}</span>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {gasData?.fast?.time || "~30 sec"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>24-Hour Gas Price Trend</CardTitle>
              <CardDescription>Historical gas prices for {selectedChain}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Historical Data Not Available</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Gas price history tracking is not yet implemented. This feature will show 24-hour gas price trends
                  once enabled.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Cost Estimator */}
          {selectedChain === "ethereum" && gasData?.standard?.gwei && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Cost Estimator</CardTitle>
                <CardDescription>Estimated costs for common transactions at current gas prices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionTypes.map((tx) => {
                    const slowCost = ((tx.gasUnits * gasData?.slow?.gwei) / 1e9) * 3000 // Assuming ETH = $3000
                    const standardCost = ((tx.gasUnits * gasData?.standard?.gwei) / 1e9) * 3000
                    const fastCost = ((tx.gasUnits * gasData?.fast?.gwei) / 1e9) * 3000

                    return (
                      <div
                        key={tx.name}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div>
                          <div className="font-semibold">{tx.name}</div>
                          <div className="text-sm text-muted-foreground">{tx.gasUnits.toLocaleString()} gas units</div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground">Slow</div>
                            <div className="font-semibold">${slowCost.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground">Standard</div>
                            <div className="font-semibold">${standardCost.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground">Fast</div>
                            <div className="font-semibold">${fastCost.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gas Saving Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Gas Saving Tips</CardTitle>
              <CardDescription>Optimize your transactions to save on fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Time your transactions</div>
                    <div className="text-muted-foreground">
                      Gas prices are typically lower on weekends and during off-peak hours (late night UTC)
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Batch your transactions</div>
                    <div className="text-muted-foreground">
                      Combine multiple operations into a single transaction when possible
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Use Layer 2 solutions</div>
                    <div className="text-muted-foreground">
                      Consider using Arbitrum, Optimism, or other L2s for significantly lower fees
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    4
                  </div>
                  <div>
                    <div className="font-semibold">Set gas alerts</div>
                    <div className="text-muted-foreground">
                      Enable alerts to get notified when gas prices drop below your target threshold
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
