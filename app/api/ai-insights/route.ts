import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, portfolioData } = body

    console.log("[v0] AI Insights request for wallet:", walletAddress)

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a DeFi portfolio analyst. Analyze the following wallet and provide insights:

Wallet Address: ${walletAddress}
Total Portfolio Value: $${portfolioData?.totalValue || 0}
Number of Tokens: ${portfolioData?.tokens?.length || 0}
Chains: ${portfolioData?.chains?.join(", ") || "Unknown"}

Token Holdings:
${portfolioData?.tokens?.map((t: any) => `- ${t.symbol}: ${t.balance} ($${t.value.toFixed(2)})`).join("\n") || "No tokens"}

Provide a comprehensive analysis including:
1. Portfolio Health Score (0-100) - Based on diversification, value distribution, and risk factors
2. Risk Assessment - Evaluate concentration risk and volatility exposure
3. Diversification Analysis - Assess token and chain distribution
4. Opportunities for Improvement - Identify gaps and optimization areas
5. Specific Actionable Recommendations - Provide 3-5 concrete next steps

Format your response in a clear, structured way with sections and bullet points.`,
      maxRetries: 2,
    })

    console.log("[v0] AI Insights generated successfully")

    return NextResponse.json({
      insights: result.text,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] AI Insights API error:", error?.message || error)
    return NextResponse.json(
      {
        error: "Failed to generate AI insights",
        details: error?.message || "AI service is currently unavailable",
        message: "Please try again later or check your AI Gateway configuration",
      },
      { status: 500 },
    )
  }
}
