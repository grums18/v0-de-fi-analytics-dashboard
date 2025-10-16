"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { WalletInput } from "@/components/wallet-input"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = (address: string) => {
    setWalletAddress(address)
    setIsAnalyzing(true)
  }

  return (
    <DashboardLayout>
      {!isAnalyzing ? (
        <WalletInput onAnalyze={handleAnalyze} />
      ) : (
        <PortfolioOverview walletAddress={walletAddress} onChangeWallet={() => setIsAnalyzing(false)} />
      )}
    </DashboardLayout>
  )
}
