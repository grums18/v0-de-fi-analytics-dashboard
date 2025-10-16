"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, Layers, Fuel, Calculator, TrendingUp, Search, Menu, X } from "lucide-react"
import { FeedbackWidget } from "@/components/feedback-widget"
import { trackPageView } from "@/lib/analytics"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Portfolio", href: "/", icon: LayoutDashboard },
  { name: "LP Positions", href: "/lp-positions", icon: Layers },
  { name: "Gas Tracker", href: "/gas-tracker", icon: Fuel },
  { name: "IL Calculator", href: "/il-calculator", icon: Calculator },
  { name: "Yield Scanner", href: "/yield-scanner", icon: TrendingUp },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [walletAddress, setWalletAddress] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const pageName = pathname === "/" ? "Portfolio" : pathname.slice(1).replace(/-/g, " ")
    trackPageView(pageName, { path: pathname })
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JT802zG7Yk1o4zrlOo0NDbua36FQJ2.png"
              alt="Newsie Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg">DeFi Analytics</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Wallet Address Input */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden lg:block w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter wallet address (ETH or SOL)..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border md:hidden">
            <div className="p-4 space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter wallet address..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="pl-9"
                />
              </div>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 lg:p-6">{children}</main>

      <FeedbackWidget />
    </div>
  )
}
