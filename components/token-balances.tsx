"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"

interface TokenBalancesProps {
  chain: "ethereum" | "solana"
  walletAddress: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TokenBalances({ chain, walletAddress }: TokenBalancesProps) {
  const { data, error, isLoading } = useSWR(`/api/portfolio/${walletAddress}?chain=${chain}`, fetcher, {
    refreshInterval: 30000,
  })

  const tokens = data?.tokens || []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Loading token balances...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-destructive">Failed to load token balances</p>
            <p className="text-xs text-muted-foreground mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
        <CardDescription>Your token holdings on {chain.charAt(0).toUpperCase() + chain.slice(1)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tokens.map((token: any) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                  {token.logo ? (
                    <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="h-8 w-8 rounded-full" />
                  ) : (
                    token.symbol.charAt(0)
                  )}
                </div>
                <div>
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ${token.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {token.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </span>
                  <Badge variant={token.change24h >= 0 ? "default" : "destructive"} className="ml-2 gap-1">
                    {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          {tokens.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No tokens found for this wallet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
