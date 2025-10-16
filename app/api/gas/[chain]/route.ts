import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { chain: string } }) {
  try {
    const { chain } = params
    console.log("[v0] Fetching gas prices for chain:", chain)

    if (chain === "ethereum") {
      const alchemyApiKey = process.env.ALCHEMY_API_KEY || "CgS5Hdt0EEKr5K2JK0lfw"
      const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`

      // Fetch current gas price using eth_gasPrice
      const gasPriceResponse = await fetch(alchemyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_gasPrice",
          params: [],
        }),
      })

      if (!gasPriceResponse.ok) {
        const errorText = await gasPriceResponse.text()
        console.error("[v0] Alchemy gas price API error:", errorText)
        throw new Error(`Failed to fetch Ethereum gas prices: ${errorText}`)
      }

      const gasPriceData = await gasPriceResponse.json()

      if (gasPriceData.error) {
        console.error("[v0] Alchemy API returned error:", gasPriceData.error)
        throw new Error(`Alchemy API error: ${gasPriceData.error.message}`)
      }

      // Fetch fee history for more accurate estimates
      const feeHistoryResponse = await fetch(alchemyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_feeHistory",
          params: ["0x5", "latest", [25, 50, 75]], // Last 5 blocks, 25th, 50th, 75th percentiles
        }),
      })

      const feeHistoryData = await feeHistoryResponse.json()
      console.log("[v0] Ethereum gas prices fetched successfully from Alchemy")

      // Convert hex to decimal and wei to gwei
      const currentGasPrice = Number.parseInt(gasPriceData.result, 16) / 1e9

      // Calculate gas prices from fee history
      let slowGwei = currentGasPrice * 0.8
      let standardGwei = currentGasPrice
      let fastGwei = currentGasPrice * 1.2

      if (feeHistoryData.result && feeHistoryData.result.reward) {
        const rewards = feeHistoryData.result.reward
        const baseFee =
          Number.parseInt(feeHistoryData.result.baseFeePerGas[feeHistoryData.result.baseFeePerGas.length - 1], 16) / 1e9

        // Calculate average priority fees
        const avgSlow =
          rewards.reduce((sum: number, r: string[]) => sum + Number.parseInt(r[0], 16), 0) / rewards.length / 1e9
        const avgStandard =
          rewards.reduce((sum: number, r: string[]) => sum + Number.parseInt(r[1], 16), 0) / rewards.length / 1e9
        const avgFast =
          rewards.reduce((sum: number, r: string[]) => sum + Number.parseInt(r[2], 16), 0) / rewards.length / 1e9

        slowGwei = baseFee + avgSlow
        standardGwei = baseFee + avgStandard
        fastGwei = baseFee + avgFast
      }

      // Fetch ETH price for USD conversion
      const ethPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      )
      const ethPriceData = await ethPriceResponse.json()
      const ethPrice = ethPriceData.ethereum?.usd || 3000

      const calculateUSD = (gwei: number) => {
        return ((gwei * 21000) / 1e9) * ethPrice
      }

      return NextResponse.json({
        chain: "ethereum",
        slow: {
          gwei: Math.round(slowGwei * 100) / 100,
          usd: calculateUSD(slowGwei),
          time: "~5 min",
        },
        standard: {
          gwei: Math.round(standardGwei * 100) / 100,
          usd: calculateUSD(standardGwei),
          time: "~2 min",
        },
        fast: {
          gwei: Math.round(fastGwei * 100) / 100,
          usd: calculateUSD(fastGwei),
          time: "~30 sec",
        },
        trend: "stable",
        change24h: 0,
      })
    } else if (chain === "solana") {
      console.log("[v0] Fetching Solana gas prices")
      // Fetch Solana recent fees
      const response = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getRecentPrioritizationFees",
          params: [],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Solana RPC error:", errorText)
        throw new Error(`Failed to fetch Solana gas prices: ${errorText}`)
      }

      const data = await response.json()
      const fees = data.result || []
      console.log("[v0] Solana gas prices fetched successfully")

      // Calculate average fee
      const avgFee =
        fees.length > 0 ? fees.reduce((sum: number, f: any) => sum + f.prioritizationFee, 0) / fees.length : 5000

      // Fetch SOL price
      const solPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
      const solPriceData = await solPriceResponse.json()
      const solPrice = solPriceData.solana?.usd || 130

      const calculateUSD = (lamports: number) => {
        return (lamports / 1e9) * solPrice
      }

      return NextResponse.json({
        chain: "solana",
        slow: {
          lamports: Math.floor(avgFee * 0.8),
          usd: calculateUSD(Math.floor(avgFee * 0.8)),
          time: "~1 sec",
        },
        standard: {
          lamports: Math.floor(avgFee),
          usd: calculateUSD(Math.floor(avgFee)),
          time: "~1 sec",
        },
        fast: {
          lamports: Math.floor(avgFee * 1.5),
          usd: calculateUSD(Math.floor(avgFee * 1.5)),
          time: "~400ms",
        },
        trend: "stable",
        change24h: 0,
      })
    }

    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Gas API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch gas prices" },
      { status: 500 },
    )
  }
}
