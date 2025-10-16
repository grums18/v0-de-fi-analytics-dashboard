"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, Search, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react"
import { trackWalletAction } from "@/lib/analytics"

interface WalletInputProps {
  onAnalyze: (address: string) => void
}

export function WalletInput({ onAnalyze }: WalletInputProps) {
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")

  const validateAddress = (addr: string): boolean => {
    // Ethereum address validation (0x + 40 hex chars)
    const ethRegex = /^0x[a-fA-F0-9]{40}$/
    // Solana address validation (32-44 base58 chars)
    const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

    return ethRegex.test(addr) || solRegex.test(addr)
  }

  const detectChain = (addr: string): "ethereum" | "solana" | null => {
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) return "ethereum"
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) return "solana"
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!address.trim()) {
      setError("Please enter a wallet address")
      return
    }

    if (!validateAddress(address.trim())) {
      setError("Invalid wallet address. Please enter a valid Ethereum or Solana address.")
      return
    }

    const chain = detectChain(address.trim())
    trackWalletAction("analyze", chain || "unknown", address.trim())

    onAnalyze(address.trim())
  }

  const handleExampleClick = (exampleAddress: string) => {
    setAddress(exampleAddress)
    setError("")
    const chain = detectChain(exampleAddress)
    trackWalletAction("example_clicked", chain || "unknown")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">DeFi Analytics Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Analyze any wallet's DeFi portfolio, LP positions, yields, and gas metrics across Ethereum and Solana
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Portfolio Tracking</h3>
                <p className="text-sm text-muted-foreground">Real-time token balances and portfolio value</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">LP Analytics</h3>
                <p className="text-sm text-muted-foreground">Track liquidity positions and impermanent loss</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Get personalized recommendations powered by AI</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Wallet Address
            </CardTitle>
            <CardDescription>Paste an Ethereum or Solana wallet address to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb or 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-mono text-sm"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                {address && !error && detectChain(address) && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {detectChain(address)} Address Detected
                    </Badge>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" size="lg">
                Analyze Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Example Addresses */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Try example addresses:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleExampleClick("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</p>
                      <p className="text-xs text-muted-foreground mt-1">Ethereum Wallet Example</p>
                    </div>
                    <Badge variant="outline">Ethereum</Badge>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleClick("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono">7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</p>
                      <p className="text-xs text-muted-foreground mt-1">Solana Wallet Example</p>
                    </div>
                    <Badge variant="outline">Solana</Badge>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">No Wallet Connection Required</p>
                <p className="text-sm text-muted-foreground">
                  This dashboard uses public blockchain data and APIs only. Your wallet never needs to connect or sign
                  transactions. Simply paste any address to analyze.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
