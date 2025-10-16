import { track } from "@vercel/analytics"

/**
 * Track custom events for user interactions
 * Uses Vercel Analytics for tracking
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    // Track with Vercel Analytics
    track(eventName, properties)

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[v0] Analytics Event:", eventName, properties)
    }
  } catch (error) {
    console.error("[v0] Analytics tracking error:", error)
  }
}

/**
 * Track page views
 */
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  trackEvent("page_view", {
    page: pageName,
    ...properties,
  })
}

/**
 * Track wallet interactions
 */
export function trackWalletAction(action: string, chain?: string, address?: string) {
  trackEvent("wallet_action", {
    action,
    chain,
    hasAddress: !!address,
  })
}

/**
 * Track API calls
 */
export function trackAPICall(endpoint: string, success: boolean, duration?: number) {
  trackEvent("api_call", {
    endpoint,
    success,
    duration,
  })
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
  trackEvent("feature_usage", {
    feature,
    action,
    ...properties,
  })
}
