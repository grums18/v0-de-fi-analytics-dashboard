import { type NextRequest, NextResponse } from "next/server"

function getHeliusApiKey(): string {
  const heliusKey = process.env.HELIUS_API_KEY || ""

  if (!heliusKey) {
    throw new Error("HELIUS_API_KEY environment variable is not configured")
  }

  // If the env var contains a full URL, extract the API key
  if (heliusKey.includes("api-key=")) {
    const match = heliusKey.match(/api-key=([^&\s]+)/)
    return match ? match[1] : heliusKey
  }

  return heliusKey
}

function getAlchemyApiKey(): string {
  const envKey = process.env.ALCHEMY_API_KEY

  if (!envKey) {
    throw new Error("ALCHEMY_API_KEY environment variable is not configured. Please add it in the Vars section.")
  }

  return envKey
}

async function alchemyRequest(apiKey: string, method: string, params: any[], network = "eth-mainnet") {
  const response = await fetch(`https://${network}.g.alchemy.com/v2/${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    try {
      const errorData = JSON.parse(errorText)
      if (errorData.error?.message?.includes("is not enabled")) {
        const error: any = new Error(errorData.error.message)
        error.code = "NETWORK_NOT_ENABLED"
        error.network = network
        throw error
      }
    } catch (parseError) {
      if ((parseError as any).code === "NETWORK_NOT_ENABLED") {
        throw parseError
      }
    }
    throw new Error(`Alchemy API error: ${errorText}`)
  }

  const data = await response.json()
  if (data.error) {
    if (data.error.message?.includes("is not enabled")) {
      const error: any = new Error(data.error.message)
      error.code = "NETWORK_NOT_ENABLED"
      error.network = network
      throw error
    }
    throw new Error(`Alchemy API error: ${data.error.message}`)
  }

  return data.result
}

async function alchemyRequestWithFallback(apiKey: string, method: string, params: any[]) {
  const networks = ["eth-mainnet", "eth-sepolia"]
  let lastError: any = null

  for (const network of networks) {
    try {
      console.log(`[v0] Trying Alchemy network: ${network}`)
      const result = await alchemyRequest(apiKey, method, params, network)
      console.log(`[v0] Successfully connected to ${network}`)
      return { result, network }
    } catch (error: any) {
      console.log(`[v0] Failed to connect to ${network}:`, error.message)
      lastError = error
      if (error.code !== "NETWORK_NOT_ENABLED") {
        throw error
      }
    }
  }

  throw new Error(
    `Unable to connect to Alchemy. Please enable ETH_MAINNET or ETH_SEPOLIA in your Alchemy dashboard: https://dashboard.alchemy.com/apps`,
  )
}

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const searchParams = request.nextUrl.searchParams
    const chain = searchParams.get("chain") || "ethereum"

    console.log("[v0] Fetching portfolio for address:", address, "chain:", chain)

    const isSolana = address.length > 42

    if (isSolana) {
      console.log("[v0] Detected Solana address")
      const heliusKey = getHeliusApiKey()

      console.log("[v0] Using Helius API key:", heliusKey.substring(0, 8) + "...")

      const response = await fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${heliusKey}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Helius API error:", errorText)
        throw new Error(`Failed to fetch Solana portfolio: ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Solana portfolio fetched successfully")

      const tokens = data.tokens?.map((token: any) => ({
        symbol: token.mint,
        name: token.name || "Unknown",
        balance: token.amount / Math.pow(10, token.decimals || 9),
        value: (token.amount / Math.pow(10, token.decimals || 9)) * (token.price || 0),
        change24h: token.priceChange24h || 0,
        logo: token.logoURI || "",
        chain: "solana",
      }))

      const totalValue = tokens?.reduce((sum: number, token: any) => sum + token.value, 0) || 0

      return NextResponse.json({
        address,
        chain: "solana",
        totalValue,
        tokens: tokens || [],
        nativeBalance: data.nativeBalance || 0,
      })
    } else {
      console.log("[v0] Detected Ethereum address")
      const alchemyApiKey = getAlchemyApiKey()
      console.log("[v0] Using Alchemy API key:", alchemyApiKey.substring(0, 8) + "...")

      const { result: ethBalanceHex, network: activeNetwork } = await alchemyRequestWithFallback(
        alchemyApiKey,
        "eth_getBalance",
        [address, "latest"],
      )
      const ethBalance = Number.parseInt(ethBalanceHex, 16) / 1e18
      console.log("[v0] ETH balance:", ethBalance, "on network:", activeNetwork)

      const { result: tokenBalances } = await alchemyRequestWithFallback(alchemyApiKey, "alchemy_getTokenBalances", [
        address,
        "erc20",
      ])
      console.log("[v0] Found", tokenBalances.tokenBalances?.length || 0, "ERC20 tokens")

      const ethPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
      )
      const ethPriceData = await ethPriceResponse.json()
      const ethPrice = ethPriceData.ethereum?.usd || 0
      const ethChange24h = ethPriceData.ethereum?.usd_24h_change || 0

      const tokens = [
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: ethBalance,
          value: ethBalance * ethPrice,
          change24h: ethChange24h,
          logo: "",
          chain: activeNetwork === "eth-sepolia" ? "sepolia" : "ethereum",
        },
      ]

      if (tokenBalances.tokenBalances && tokenBalances.tokenBalances.length > 0) {
        for (const token of tokenBalances.tokenBalances) {
          if (token.tokenBalance === "0x0" || token.tokenBalance === "0") continue

          try {
            const { result: metadata } = await alchemyRequestWithFallback(alchemyApiKey, "alchemy_getTokenMetadata", [
              token.contractAddress,
            ])

            const balance = Number.parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals || 18)

            if (balance < 0.000001) continue

            tokens.push({
              symbol: metadata.symbol || "UNKNOWN",
              name: metadata.name || "Unknown Token",
              balance,
              value: 0,
              change24h: 0,
              logo: metadata.logo || "",
              chain: activeNetwork === "eth-sepolia" ? "sepolia" : "ethereum",
            })
          } catch (error) {
            console.error("[v0] Error fetching token metadata:", error)
          }
        }
      }

      const totalValue = tokens.reduce((sum, token) => sum + token.value, 0)
      console.log("[v0] Portfolio total value:", totalValue)

      return NextResponse.json({
        address,
        chain: activeNetwork === "eth-sepolia" ? "sepolia" : "ethereum",
        totalValue,
        tokens,
        nativeBalance: ethBalance,
        network: activeNetwork,
      })
    }
  } catch (error) {
    console.error("[v0] Portfolio API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch portfolio data" },
      { status: 500 },
    )
  }
}
