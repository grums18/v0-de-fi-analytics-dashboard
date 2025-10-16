"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Droplets,
  Shield,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
  Star,
  Zap,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type RiskLevel = "all" | "low" | "medium" | "high"
type OpportunityType = "all" | "LP" | "Lending" | "Staking" | "Vault"

export function YieldScanner() {
  const [selectedChain, setSelectedChain] = useState<"all" | "ethereum" | "solana">("all")
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>("all")
  const [selectedType, setSelectedType] = useState<OpportunityType>("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const { data, error, mutate, isLoading } = useSWR(`/api/yields`, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  })

  const handleRefresh = () => {
    mutate()
  }

  const allOpportunities = data?.opportunities || []
  const filteredOpportunities = allOpportunities.filter((opp: any) => {
    if (selectedChain !== "all" && opp.chain !== selectedChain) return false
    if (selectedRisk !== "all" && opp.risk !== selectedRisk) return false
    if (selectedType !== "all" && opp.type !== selectedType) return false
    if (showFeaturedOnly && !opp.featured) return false
    return true
  })

  const sortedOpportunities = [...filteredOpportunities].sort((a: any, b: any) => b.apy - a.apy)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-accent"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <Shield className="h-3 w-3" />
      case "medium":
        return <AlertTriangle className="h-3 w-3" />
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yield Opportunities</h1>
          <p className="text-muted-foreground mt-1">Discover the best yield farming opportunities across DeFi</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* ... existing filter code ... */}
            <div className="flex gap-2">
              <Button
                variant={selectedChain === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain("all")}
              >
                All Chains
              </Button>
              <Button
                variant={selectedChain === "ethereum" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain("ethereum")}
              >
                Ethereum
              </Button>
              <Button
                variant={selectedChain === "solana" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain("solana")}
              >
                Solana
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex gap-2">
              <Button
                variant={selectedRisk === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("all")}
              >
                All Risk
              </Button>
              <Button
                variant={selectedRisk === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("low")}
              >
                Low
              </Button>
              <Button
                variant={selectedRisk === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("medium")}
              >
                Medium
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All Types
              </Button>
              <Button
                variant={selectedType === "LP" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("LP")}
              >
                LP
              </Button>
              <Button
                variant={selectedType === "Lending" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("Lending")}
              >
                Lending
              </Button>
              <Button
                variant={selectedType === "Staking" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("Staking")}
              >
                Staking
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Featured Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedOpportunities.length} opportunities
          {sortedOpportunities.length > 0 && (
            <span className="ml-2">
              • Avg APY:{" "}
              {(
                sortedOpportunities.reduce((sum: number, opp: any) => sum + opp.apy, 0) / sortedOpportunities.length
              ).toFixed(1)}
              %
            </span>
          )}
        </p>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Loading yield opportunities...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          sortedOpportunities.map((opportunity: any) => (
            <Card key={opportunity.id} className={cn(opportunity.featured && "border-primary/50")}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* ... existing opportunity card code ... */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold">{opportunity.protocol}</h3>
                      <Badge variant="secondary">{opportunity.asset}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {opportunity.chain}
                      </Badge>
                      <Badge variant="outline">{opportunity.type}</Badge>
                      {opportunity.trending && (
                        <Badge variant="default" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                      {opportunity.featured && (
                        <Badge variant="default" className="gap-1 bg-primary/20 text-primary border-primary">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">APY</p>
                        <p className="font-semibold text-xl flex items-center gap-1 text-accent">
                          {opportunity.apy}%
                          <TrendingUp className="h-4 w-4" />
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TVL</p>
                        <p className="font-semibold">
                          $
                          {opportunity.tvl >= 1000000000
                            ? `${(opportunity.tvl / 1000000000).toFixed(2)}B`
                            : `${(opportunity.tvl / 1000000).toFixed(0)}M`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Level</p>
                        <p
                          className={cn(
                            "font-semibold flex items-center gap-1 capitalize",
                            getRiskColor(opportunity.risk),
                          )}
                        >
                          {getRiskIcon(opportunity.risk)}
                          {opportunity.risk}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col">
                    <Button variant="default" size="sm" className="gap-2 flex-1 lg:flex-none">
                      <Droplets className="h-4 w-4" />
                      Deposit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 lg:flex-none bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                      View Protocol
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {!isLoading && sortedOpportunities.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No opportunities found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Try adjusting your filters to see more yield farming opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
