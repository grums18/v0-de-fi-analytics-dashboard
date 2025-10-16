import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const searchParams = request.nextUrl.searchParams
    const chain = searchParams.get("chain") || "ethereum"

    // Use The Graph to fetch LP positions
    const graphQuery = `
      query GetLPPositions($address: String!) {
        user(id: $address) {
          liquidityPositions {
            id
            liquidityTokenBalance
            pair {
              id
              token0 {
                symbol
                name
              }
              token1 {
                symbol
                name
              }
              reserve0
              reserve1
              reserveUSD
              volumeUSD
            }
          }
        }
      }
    `

    // Uniswap V2 subgraph endpoint
    const subgraphUrl =
      chain === "ethereum"
        ? "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
        : "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"

    const response = await fetch(subgraphUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: graphQuery,
        variables: { address: address.toLowerCase() },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch LP positions from The Graph")
    }

    const data = await response.json()
    const positions = data.data?.user?.liquidityPositions || []

    // Transform positions data
    const transformedPositions = positions.map((position: any, index: number) => {
      const pair = position.pair
      const reserveUSD = Number.parseFloat(pair.reserveUSD || 0)
      const volumeUSD = Number.parseFloat(pair.volumeUSD || 0)

      // Calculate estimated APY based on volume (simplified)
      const dailyVolume = volumeUSD / 365
      const dailyFees = dailyVolume * 0.003 // 0.3% fee
      const apy = reserveUSD > 0 ? (dailyFees * 365 * 100) / reserveUSD : 0

      // Calculate position value (simplified)
      const totalSupply = Number.parseFloat(position.liquidityTokenBalance || 0)
      const positionValue = (totalSupply / 1e18) * reserveUSD

      return {
        id: position.id,
        protocol: "Uniswap V2",
        pair: `${pair.token0.symbol}/${pair.token1.symbol}`,
        liquidity: positionValue,
        feesEarned: positionValue * 0.05, // Estimated 5% fees earned
        apy: Math.min(apy, 100), // Cap at 100%
        il: -2.5, // Simplified IL calculation
        priceRange: "Full Range",
        inRange: true,
        chain,
      }
    })

    return NextResponse.json({
      address,
      chain,
      positions: transformedPositions,
    })
  } catch (error) {
    console.error("[v0] LP Positions API error:", error)
    return NextResponse.json({ error: "Failed to fetch LP positions" }, { status: 500 })
  }
}
