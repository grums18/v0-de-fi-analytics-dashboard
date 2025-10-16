"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingDown, DollarSign, AlertCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackFeatureUsage } from "@/lib/analytics"

export function ILCalculator() {
  // Initial state
  const [tokenASymbol, setTokenASymbol] = useState("ETH")
  const [tokenBSymbol, setTokenBSymbol] = useState("USDC")
  const [tokenAAmount, setTokenAAmount] = useState("10")
  const [tokenBAmount, setTokenBAmount] = useState("30000")
  const [tokenAInitialPrice, setTokenAInitialPrice] = useState("3000")
  const [tokenBInitialPrice, setTokenBInitialPrice] = useState("1")
  const [tokenACurrentPrice, setTokenACurrentPrice] = useState("3600")
  const [tokenBCurrentPrice, setTokenBCurrentPrice] = useState("1")

  // Calculated values
  const [results, setResults] = useState({
    initialValue: 0,
    hodlValue: 0,
    lpValue: 0,
    impermanentLoss: 0,
    impermanentLossPercent: 0,
    feesNeeded: 0,
  })

  useEffect(() => {
    calculateIL()
  }, [tokenAAmount, tokenBAmount, tokenAInitialPrice, tokenBInitialPrice, tokenACurrentPrice, tokenBCurrentPrice])

  const calculateIL = () => {
    const amountA = Number.parseFloat(tokenAAmount) || 0
    const amountB = Number.parseFloat(tokenBAmount) || 0
    const priceA0 = Number.parseFloat(tokenAInitialPrice) || 0
    const priceB0 = Number.parseFloat(tokenBInitialPrice) || 0
    const priceA1 = Number.parseFloat(tokenACurrentPrice) || 0
    const priceB1 = Number.parseFloat(tokenBCurrentPrice) || 0

    if (amountA === 0 || amountB === 0 || priceA0 === 0 || priceB0 === 0) {
      return
    }

    // Initial value
    const initialValue = amountA * priceA0 + amountB * priceB0

    // HODL value (if you just held the tokens)
    const hodlValue = amountA * priceA1 + amountB * priceB1

    // Calculate price ratio change
    const priceRatio0 = priceA0 / priceB0
    const priceRatio1 = priceA1 / priceB1
    const priceRatioChange = priceRatio1 / priceRatio0

    // LP value using constant product formula
    // k = x * y (constant)
    // When price changes, amounts rebalance
    const k = amountA * amountB
    const newAmountA = Math.sqrt(k / priceRatioChange)
    const newAmountB = Math.sqrt(k * priceRatioChange)

    const lpValue = newAmountA * priceA1 + newAmountB * priceB1

    // Impermanent Loss
    const impermanentLoss = lpValue - hodlValue
    const impermanentLossPercent = ((lpValue - hodlValue) / hodlValue) * 100

    // Fees needed to break even
    const feesNeeded = Math.abs(impermanentLoss)

    setResults({
      initialValue,
      hodlValue,
      lpValue,
      impermanentLoss,
      impermanentLossPercent,
      feesNeeded,
    })
  }

  const handleReset = () => {
    trackFeatureUsage("il_calculator", "reset")
    setTokenASymbol("ETH")
    setTokenBSymbol("USDC")
    setTokenAAmount("10")
    setTokenBAmount("30000")
    setTokenAInitialPrice("3000")
    setTokenBInitialPrice("1")
    setTokenACurrentPrice("3600")
    setTokenBCurrentPrice("1")
  }

  const handleCalculate = () => {
    trackFeatureUsage("il_calculator", "calculate", {
      tokenA: tokenASymbol,
      tokenB: tokenBSymbol,
      ilPercent: results.impermanentLossPercent.toFixed(2),
    })
  }

  useEffect(() => {
    if (results.impermanentLoss !== 0) {
      handleCalculate()
    }
  }, [results.impermanentLoss])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impermanent Loss Calculator</h1>
          <p className="text-muted-foreground mt-1">Calculate potential IL for your liquidity pool positions</p>
        </div>
        <Button onClick={handleReset} variant="outline" className="gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Token A Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token A</CardTitle>
              <CardDescription>Enter details for the first token in the pair</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenASymbol">Token Symbol</Label>
                <Input
                  id="tokenASymbol"
                  value={tokenASymbol}
                  onChange={(e) => setTokenASymbol(e.target.value)}
                  placeholder="ETH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenAAmount">Amount</Label>
                <Input
                  id="tokenAAmount"
                  type="number"
                  value={tokenAAmount}
                  onChange={(e) => setTokenAAmount(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAInitialPrice">Initial Price ($)</Label>
                  <Input
                    id="tokenAInitialPrice"
                    type="number"
                    value={tokenAInitialPrice}
                    onChange={(e) => setTokenAInitialPrice(e.target.value)}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenACurrentPrice">Current Price ($)</Label>
                  <Input
                    id="tokenACurrentPrice"
                    type="number"
                    value={tokenACurrentPrice}
                    onChange={(e) => setTokenACurrentPrice(e.target.value)}
                    placeholder="3600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token B Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token B</CardTitle>
              <CardDescription>Enter details for the second token in the pair</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenBSymbol">Token Symbol</Label>
                <Input
                  id="tokenBSymbol"
                  value={tokenBSymbol}
                  onChange={(e) => setTokenBSymbol(e.target.value)}
                  placeholder="USDC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenBAmount">Amount</Label>
                <Input
                  id="tokenBAmount"
                  type="number"
                  value={tokenBAmount}
                  onChange={(e) => setTokenBAmount(e.target.value)}
                  placeholder="30000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenBInitialPrice">Initial Price ($)</Label>
                  <Input
                    id="tokenBInitialPrice"
                    type="number"
                    value={tokenBInitialPrice}
                    onChange={(e) => setTokenBInitialPrice(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenBCurrentPrice">Current Price ($)</Label>
                  <Input
                    id="tokenBCurrentPrice"
                    type="number"
                    value={tokenBCurrentPrice}
                    onChange={(e) => setTokenBCurrentPrice(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Initial Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${results.initialValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Value when you entered the pool</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HODL Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${results.hodlValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">If you just held the tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LP Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${results.lpValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Current value in the pool</p>
              </CardContent>
            </Card>
          </div>

          {/* IL Result */}
          <Card className={cn(results.impermanentLoss < 0 ? "border-destructive" : "border-accent")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Impermanent Loss
                </CardTitle>
                <Badge variant={results.impermanentLoss < 0 ? "destructive" : "default"} className="gap-1">
                  {results.impermanentLoss < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                  {results.impermanentLossPercent.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div
                  className={cn("text-3xl font-bold", results.impermanentLoss < 0 ? "text-destructive" : "text-accent")}
                >
                  {results.impermanentLoss < 0 ? "-" : "+"}$
                  {Math.abs(results.impermanentLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.impermanentLoss < 0 ? "Loss" : "Gain"} compared to holding
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fees needed to break even:</span>
                  <span className="font-semibold">
                    ${results.feesNeeded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5" />
                Understanding Impermanent Loss
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Impermanent Loss occurs when the price ratio of tokens in a liquidity pool changes compared to when you
                deposited them.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    1
                  </div>
                  <p className="text-muted-foreground">The larger the price change, the greater the impermanent loss</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    2
                  </div>
                  <p className="text-muted-foreground">Trading fees can offset or exceed impermanent loss</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    3
                  </div>
                  <p className="text-muted-foreground">Loss becomes permanent only when you withdraw from the pool</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
