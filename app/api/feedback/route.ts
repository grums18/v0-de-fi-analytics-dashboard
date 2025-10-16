import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const feedback = await request.json()

    // Log feedback to console (in production, you'd save to database or send to service)
    console.log("[v0] Feedback received:", {
      type: feedback.type,
      hasEmail: !!feedback.email,
      timestamp: feedback.timestamp,
      url: feedback.url,
    })

    // In production, you would:
    // 1. Save to database
    // 2. Send to email service
    // 3. Post to Slack/Discord webhook
    // 4. Send to analytics platform

    // For now, just log it
    console.log("[v0] Feedback details:", feedback)

    return NextResponse.json({ success: true, message: "Feedback received" })
  } catch (error) {
    console.error("[v0] Feedback API error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}
