"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

type FeedbackType = "bug" | "feature" | "general"

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Track feedback submission
      trackEvent("feedback_submitted", {
        type: feedbackType,
        hasEmail: !!email,
      })

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          email,
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          setOpen(false)
          setIsSubmitted(false)
          setEmail("")
          setMessage("")
          setFeedbackType("general")
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 fixed bottom-6 right-6 z-50 shadow-lg bg-card hover:bg-accent"
          onClick={() => trackEvent("feedback_opened")}
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve DeFi Analytics Dashboard. Share your thoughts, report bugs, or request features.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thank you for your feedback!</h3>
            <p className="text-sm text-muted-foreground text-center">
              We appreciate your input and will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={feedbackType === "bug" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedbackType("bug")}
                  className="flex-1"
                >
                  Bug Report
                </Button>
                <Button
                  type="button"
                  variant={feedbackType === "feature" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedbackType("feature")}
                  className="flex-1"
                >
                  Feature Request
                </Button>
                <Button
                  type="button"
                  variant={feedbackType === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedbackType("general")}
                  className="flex-1"
                >
                  General
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We'll only use this to follow up on your feedback</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="resize-none"
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !message.trim()} className="w-full gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
