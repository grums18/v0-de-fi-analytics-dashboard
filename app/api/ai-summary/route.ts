import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, portfolioValue } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a DeFi portfolio analyst. Analyze this wallet and provide a concise summary:

Wallet: ${walletAddress}
Portfolio Value: $${portfolioValue}

Provide a JSON response with:
1. healthScore (0-100): Overall portfolio health
2. sentiment ("bullish", "neutral", or "bearish"): Market sentiment
3. keyInsights (array of 3 strings): Top 3 insights about the portfolio
4. topRecommendation (string): Single most important recommendation

Format your response as valid JSON only, no markdown or extra text.`,
    })

    // Parse the AI response
    let summary
    try {
      summary = JSON.parse(text)
    } catch {
      // Fallback if AI doesn't return valid JSON
      summary = {
        healthScore: 75,
        sentiment: "neutral",
        keyInsights: [
          "Portfolio analysis in progress",
          `Total value: $${portfolioValue.toFixed(2)}`,
          "Consider diversifying across multiple chains",
        ],
        topRecommendation: "Monitor gas fees for optimal transaction timing",
      }
    }

    return NextResponse.json({
      summary,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] AI Summary API error:", error)
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 })
  }
}
