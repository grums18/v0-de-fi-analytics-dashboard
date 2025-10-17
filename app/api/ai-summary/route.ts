import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, portfolioValue } = body

    console.log("[v0] AI Summary request for wallet:", walletAddress)

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a DeFi portfolio analyst. Analyze this wallet and provide a concise summary:

Wallet: ${walletAddress}
Portfolio Value: $${portfolioValue}

Provide a JSON response with:
1. healthScore (0-100): Overall portfolio health based on value, diversification, and risk
2. sentiment ("bullish", "neutral", or "bearish"): Market sentiment
3. keyInsights (array of 3 strings): Top 3 insights about the portfolio
4. topRecommendation (string): Single most important recommendation

Format your response as valid JSON only, no markdown or extra text.`,
      maxRetries: 2,
    })

    const summary = JSON.parse(result.text)
    console.log("[v0] AI Summary generated successfully")

    return NextResponse.json({
      summary,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] AI Summary API error:", error?.message || error)
    return NextResponse.json(
      {
        error: "Failed to generate AI summary",
        details: error?.message || "AI service is currently unavailable",
        message: "Please try again later or check your AI Gateway configuration",
      },
      { status: 500 },
    )
  }
}
