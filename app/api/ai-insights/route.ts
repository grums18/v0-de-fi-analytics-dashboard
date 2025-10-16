import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, portfolioData } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a DeFi portfolio analyst. Analyze the following wallet and provide insights:

Wallet Address: ${walletAddress}
Total Portfolio Value: $${portfolioData?.totalValue || 0}
Number of Tokens: ${portfolioData?.tokens?.length || 0}
Chains: ${portfolioData?.chains?.join(", ") || "Unknown"}

Token Holdings:
${portfolioData?.tokens?.map((t: any) => `- ${t.symbol}: ${t.balance} ($${t.value.toFixed(2)})`).join("\n") || "No tokens"}

Provide a comprehensive analysis including:
1. Portfolio Health Score (0-100)
2. Risk Assessment
3. Diversification Analysis
4. Opportunities for Improvement
5. Specific Actionable Recommendations

Format your response in a clear, structured way with sections and bullet points.`,
    })

    return NextResponse.json({
      insights: text,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] AI Insights API error:", error)
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 })
  }
}
