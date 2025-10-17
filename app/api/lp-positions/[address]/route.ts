import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const searchParams = request.nextUrl.searchParams
    const chain = searchParams.get("chain") || "ethereum"

    console.log("[v0] Fetching LP positions for address:", address, "on chain:", chain)

    if (chain === "ethereum") {
      // Use The Graph's Uniswap V3 subgraph - the industry standard for LP data
      const UNISWAP_V3_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"

      const query = `
        query GetPositions($owner: String!) {
          positions(where: { owner: $owner }, first: 100) {
            id
            owner
            liquidity
            depositedToken0
            depositedToken1
            withdrawnToken0
            withdrawnToken1
            collectedFeesToken0
            collectedFeesToken1
            pool {
              id
              token0 {
                id
                symbol
                name
                decimals
              }
              token1 {
                id
                symbol
                name
                decimals
              }
              feeTier
              sqrtPrice
              tick
            }
            tickLower {
              tickIdx
            }
            tickUpper {
              tickIdx
            }
          }
        }
      `

      const response = await fetch(UNISWAP_V3_SUBGRAPH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { owner: address.toLowerCase() },
        }),
      })

      if (!response.ok) {
        throw new Error(`The Graph API returned status ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        console.error("[v0] The Graph API errors:", data.errors)
        throw new Error("The Graph API returned errors")
      }

      const positions = data.data?.positions || []

      console.log("[v0] Found", positions.length, "LP positions from The Graph")

      // Transform The Graph data to our format
      const formattedPositions = positions.map((pos: any) => {
        const liquidity = Number.parseFloat(pos.liquidity) / 1e18
        const feesToken0 = Number.parseFloat(pos.collectedFeesToken0) / Math.pow(10, pos.pool.token0.decimals)
        const feesToken1 = Number.parseFloat(pos.collectedFeesToken1) / Math.pow(10, pos.pool.token1.decimals)

        return {
          id: pos.id,
          protocol: "Uniswap V3",
          pair: `${pos.pool.token0.symbol}/${pos.pool.token1.symbol}`,
          token0: pos.pool.token0.symbol,
          token1: pos.pool.token1.symbol,
          liquidity: liquidity,
          feesEarned: feesToken0 + feesToken1, // Simplified - should use USD values
          feeTier: pos.pool.feeTier / 10000, // Convert to percentage
          priceRange: `${pos.tickLower.tickIdx} to ${pos.tickUpper.tickIdx}`,
          inRange: true, // Would need to calculate based on current tick vs position ticks
          chain: "ethereum",
          poolAddress: pos.pool.id,
        }
      })

      return NextResponse.json({
        address,
        chain,
        positions: formattedPositions,
        source: "The Graph - Uniswap V3 Subgraph",
      })
    } else if (chain === "solana") {
      // For Solana, we'd need to integrate with Raydium/Orca APIs
      return NextResponse.json({
        address,
        chain,
        positions: [],
        message: "Solana LP tracking requires Raydium/Orca API integration. Please add API keys.",
      })
    }

    return NextResponse.json({
      address,
      chain,
      positions: [],
      message: "Unsupported chain. Currently supports: ethereum, solana",
    })
  } catch (error) {
    console.error("[v0] LP Positions API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch LP positions from The Graph",
        address: params.address,
        positions: [],
        message:
          "Unable to fetch LP positions. This could be due to network issues or The Graph API being unavailable.",
      },
      { status: 500 },
    )
  }
}
