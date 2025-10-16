import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch yield opportunities from DeFi Llama
    const response = await fetch("https://yields.llama.fi/pools")

    if (!response.ok) {
      throw new Error("Failed to fetch yield data from DeFi Llama")
    }

    const data = await response.json()

    // Filter and transform the data
    const opportunities = data.data
      .filter((pool: any) => {
        // Filter for quality pools
        return (
          pool.tvlUsd > 1000000 && // TVL > $1M
          pool.apy > 0 &&
          pool.apy < 1000 && // Filter out unrealistic APYs
          (pool.chain === "Ethereum" || pool.chain === "Solana")
        )
      })
      .slice(0, 50) // Limit to top 50
      .map((pool: any) => {
        // Determine risk level based on TVL and protocol
        let risk = "medium"
        if (pool.tvlUsd > 100000000 && ["Aave", "Compound", "Uniswap", "Curve", "Lido"].includes(pool.project)) {
          risk = "low"
        } else if (pool.tvlUsd < 10000000) {
          risk = "high"
        }

        // Determine opportunity type
        let type = "LP"
        if (pool.project.toLowerCase().includes("aave") || pool.project.toLowerCase().includes("compound")) {
          type = "Lending"
        } else if (pool.project.toLowerCase().includes("lido") || pool.project.toLowerCase().includes("stake")) {
          type = "Staking"
        } else if (pool.project.toLowerCase().includes("yearn") || pool.project.toLowerCase().includes("vault")) {
          type = "Vault"
        }

        return {
          id: pool.pool,
          protocol: pool.project,
          chain: pool.chain.toLowerCase(),
          asset: pool.symbol,
          type,
          apy: Number.parseFloat(pool.apy.toFixed(2)),
          tvl: pool.tvlUsd,
          risk,
          trending: pool.apyPct30D > 0,
          featured: pool.tvlUsd > 100000000 && pool.apy > 5,
        }
      })

    return NextResponse.json({
      opportunities,
      count: opportunities.length,
    })
  } catch (error) {
    console.error("[v0] Yields API error:", error)
    return NextResponse.json({ error: "Failed to fetch yield opportunities" }, { status: 500 })
  }
}
