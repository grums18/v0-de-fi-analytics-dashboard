"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Droplets,
  DollarSign,
  Percent,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LPPositionsList() {
  const [walletAddress] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
  const [selectedChain, setSelectedChain] = useState<"all" | "ethereum" | "solana">("all")

  const { data, error, mutate, isLoading } = useSWR(
    selectedChain === "all" ? null : `/api/lp-positions/${walletAddress}?chain=${selectedChain}`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    },
  )

  const handleRefresh = () => {
    mutate()
  }

  const allPositions = data?.positions || []
  const totalLiquidity = allPositions.reduce((sum: number, pos: any) => sum + pos.liquidity, 0)
  const totalFeesEarned = allPositions.reduce((sum: number, pos: any) => sum + pos.feesEarned, 0)
  const avgAPY =
    allPositions.length > 0 ? allPositions.reduce((sum: number, pos: any) => sum + pos.apy, 0) / allPositions.length : 0
  const totalIL = allPositions.reduce((sum: number, pos: any) => sum + pos.il, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LP Positions</h1>
          <p className="text-muted-foreground mt-1">Track your liquidity pool positions and earnings</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalLiquidity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across {allPositions.length} positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalFeesEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total fees collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAPY.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span>Weighted average</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impermanent Loss</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalIL.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Total IL across positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Chain Filter Tabs */}
      <Tabs value={selectedChain} onValueChange={(v) => setSelectedChain(v as typeof selectedChain)}>
        <TabsList>
          <TabsTrigger value="all">All Chains</TabsTrigger>
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedChain} className="space-y-4 mt-6">
          {isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Loading LP positions...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading &&
            allPositions.map((position: any) => (
              <Card key={position.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Position Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold">{position.pair}</h3>
                        <Badge variant="secondary">{position.protocol}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {position.chain}
                        </Badge>
                        {position.inRange ? (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            In Range
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Out of Range
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Liquidity</p>
                          <p className="font-semibold">
                            ${position.liquidity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fees Earned</p>
                          <p className="font-semibold text-accent">
                            ${position.feesEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">APY</p>
                          <p className="font-semibold flex items-center gap-1">
                            {position.apy}%
                            <TrendingUp className="h-3 w-3 text-accent" />
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Impermanent Loss</p>
                          <p className={cn("font-semibold", position.il < 0 ? "text-destructive" : "text-accent")}>
                            {position.il}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Price Range:</span>
                        <span className="font-medium">{position.priceRange}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Button variant="outline" size="sm" className="gap-2 flex-1 lg:flex-none bg-transparent">
                        <ExternalLink className="h-4 w-4" />
                        View on {position.protocol}
                      </Button>
                      <Button variant="secondary" size="sm" className="flex-1 lg:flex-none">
                        Manage Position
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {!isLoading && allPositions.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No LP positions found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    You don't have any active liquidity pool positions on this chain. Start providing liquidity to earn
                    fees and rewards.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
