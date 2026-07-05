import { Check, Crown, Loader2, Sparkles, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../components/theme-provider"
import { cn } from "../lib/utils"
import { useAuth } from "../hooks/useAuth"
import { usePricing } from "../hooks/usePricing"
import { subscribeToPlan } from "../services/pricingService"
import { openRazorpayCheckout } from "../services/razorpay"
import { useAppStore } from "../store/useAppStore"

interface PricingPlan {
  name: string
  price: string
  priceUsd: string
  description: string
  features: string[]
  highlight?: boolean
}

const plans: PricingPlan[] = [
  {
    name: "INDIE",
    price: "₹399/month",
    priceUsd: "$4.99/month",
    description: "Best for students",
    features: [
      "500 credits/month",
      "No commercial license",
      "Community support",
      "Standard priority",
      "5GB storage",
    ],
  },
  {
    name: "PRO",
    price: "₹1,299/month",
    priceUsd: "$19.99/month",
    description: "Great for indie developers",
    features: [
      "3,000 credits/month",
      "Standard priority",
      "20GB storage",
      "Commercial license",
      "Unity/Unreal helpers",
      "Full export options",
    ],
    highlight: true,
  },
  {
    name: "PRO_PLUS",
    price: "₹2,499/month",
    priceUsd: "$34.99/month",
    description: "For creators who need more",
    features: [
      "8,000 credits/month",
      "High priority queue",
      "100GB storage",
      "Commercial license",
      "Early access features",
      "AI code generation",
      "Custom export presets",
    ],
  },
  {
    name: "STUDIO",
    price: "₹49,999+ /month",
    priceUsd: "$999+ /month",
    description: "For studios & production houses",
    features: [
      "Unlimited credits",
      "Unlimited team seats",
      "Unlimited storage",
      "Private inference endpoint",
      "Guaranteed SLA",
      "Dedicated support engineer",
      "On-premise deployment option",
      "Custom model fine-tuning",
    ],
  },
]

export function Pricing() {
  const navigate = useNavigate()
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useAppStore()

  useEffect(() => {
    setIsUpgradeModalOpen(true)
  }, [setIsUpgradeModalOpen])

  // Map plan names to database plan names
  const planNameMap: Record<string, string> = {
    INDIE: "INDIE",
    PRO: "PRO",
    PRO_PLUS: "PRO_PLUS",
    STUDIO: "STUDIO",
  }

  return (
    <div className="min-h-screen bg-background">
      <UpgradeModal
        open={isUpgradeModalOpen}
        onClose={() => {
          setIsUpgradeModalOpen(false)
          navigate(-1)
        }}
      />
    </div>
  )
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const { plans: dbPlans, subscription, refresh, loading: pricingLoading } = usePricing({ includeUsage: false })
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billing, setBilling] = useState<"monthly" | "annual">("annual")

  const isDark = theme === "dark"

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const planNameMap: Record<string, string> = {
    INDIE: "INDIE",
    PRO: "PRO",
    PRO_PLUS: "PRO_PLUS",
    STUDIO: "STUDIO",
  }

  const handleGetStarted = async (planName: string) => {
    if (!isAuthenticated) {
      navigate("/signup")
      return
    }

    if (!user) {
      setError("Please log in to subscribe")
      return
    }

    if (planName === "STUDIO") {
      alert("Please contact sales for STUDIO plan subscription")
      return
    }

    const dbPlanName = planNameMap[planName]
    const dbPlan = dbPlans.find((p) => p.name === dbPlanName)

    if (!dbPlan) {
      setError(`Plan ${planName} not found. Please try again later.`)
      return
    }

    if (subscription && subscription.planName === dbPlanName && subscription.status === "active") {
      alert(`You are already subscribed to ${dbPlan.displayName}`)
      return
    }

    setProcessingPlan(planName)
    setError(null)

    try {
      const billingMonths = billing === "annual" ? 12 : 1
      const billingDiscount = billing === "annual" ? 0.9 : 1
      const amountInPaise = Math.round(dbPlan.priceInr * billingMonths * billingDiscount * 100)
      const iconUrl = new URL("/images/app/new-icon2.png", window.location.origin).href

      await openRazorpayCheckout(
        {
          amount: amountInPaise,
          currency: "INR",
          name: "KOYE AI",
          description: `${billing === "annual" ? "Annual" : "Monthly"} subscription to ${dbPlan.displayName}`,
          image: iconUrl,
          prefill: {
            name: user.email?.split("@")[0] || "User",
            email: user.email || undefined,
          },
          notes: {
            plan_id: dbPlan.id,
            plan_name: dbPlan.name,
            user_id: user.id,
            billing_cycle: billing,
          },
          theme: {
            color: "#000000",
          },
        },
        async () => {
          try {
            await subscribeToPlan(user.id, dbPlan.id)
            await refresh()
            setProcessingPlan(null)
            onClose()
            navigate("/dashboard?tab=usage")
          } catch (error) {
            console.error("Error updating subscription:", error)
            setError("Payment successful but failed to update subscription. Please contact support.")
            setProcessingPlan(null)
          }
        },
        (error) => {
          console.error("Payment error:", error)
          setError(error.message || "Payment failed. Please try again.")
          setProcessingPlan(null)
        }
      )
    } catch (error) {
      console.error("Error initiating payment:", error)
      setError(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.")
      setProcessingPlan(null)
    }
  }

  const featuredPlans = plans.filter((p) => ["INDIE", "PRO", "PRO_PLUS"].includes(p.name))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close upgrade modal"
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "relative w-full max-w-5xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col",
              isDark ? "bg-[#0d0d0f] border-white/10 text-white" : "bg-background border-border text-foreground"
            )}
          >
            <div className={cn("flex items-center justify-between px-6 py-4 border-b", isDark ? "border-white/10" : "border-border")}>
              <div className="flex items-center gap-3">
                <Sparkles className={cn("h-4 w-4", isDark ? "text-amber-300" : "text-amber-600")} />
                <div>
                  <div className="font-semibold">Upgrade Your Plan</div>
                  <div className={cn("text-xs mt-0.5", isDark ? "text-white/60" : "text-muted-foreground")}>
                    Choose a plan that matches your workflow. Annual saves 10%.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                  isDark ? "hover:bg-white/10" : "hover:bg-muted"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 flex items-center justify-center">
              <div className={cn("inline-flex rounded-full border p-1", isDark ? "border-white/10" : "border-border")}>
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                    billing === "monthly"
                      ? isDark ? "bg-white text-black" : "bg-foreground text-background"
                      : isDark ? "text-white/70 hover:bg-white/5" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2",
                    billing === "annual"
                      ? isDark ? "bg-white text-black" : "bg-foreground text-background"
                      : isDark ? "text-white/70 hover:bg-white/5" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Annual
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", isDark ? "bg-amber-400/20 text-amber-300" : "bg-amber-500/15 text-amber-700")}>
                    SAVE 10%
                  </span>
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredPlans.map((plan) => {
                  const highlight = plan.name === "PRO"
                  const dbPlanName = planNameMap[plan.name]
                  const dbPlan = dbPlans.find((p) => p.name === dbPlanName)
                  const isCurrent = !!subscription && subscription.planName === dbPlanName && subscription.status === "active"
                  const isProcessing = processingPlan === plan.name
                  const monthlyUsd = dbPlan ? dbPlan.priceUsd : parseFloat(plan.priceUsd.replace(/[^0-9.]/g, "")) || 0
                  const monthlyInr = dbPlan ? dbPlan.priceInr : parseFloat(plan.price.replace(/[^0-9.]/g, "").replaceAll(",", "")) || 0
                  const discountedMonthlyUsd = billing === "annual" ? monthlyUsd * 0.9 : monthlyUsd
                  const discountedMonthlyInr = billing === "annual" ? monthlyInr * 0.9 : monthlyInr
                  const billedText = billing === "annual" ? "billed annually" : "billed monthly"
                  const annualTotalInr = monthlyInr * 12 * 0.9
                  const canCheckout = !!dbPlan && !pricingLoading

                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "rounded-2xl border p-5 flex flex-col gap-4",
                        isDark ? "border-white/10 bg-white/[0.03]" : "border-border bg-card",
                        highlight ? (isDark ? "ring-1 ring-amber-400/30" : "ring-1 ring-amber-500/30") : ""
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold">{plan.name === "INDIE" ? "Standard" : plan.name === "PRO" ? "Pro" : "Ultra"}</div>
                          <div className={cn("mt-1 text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>{plan.description}</div>
                        </div>
                        {highlight && (
                          <span className={cn("whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", isDark ? "border-amber-400/30 text-amber-300" : "border-amber-500/30 text-amber-700")}>
                            Most Popular
                          </span>
                        )}
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-3xl font-bold tracking-tight">
                            ${discountedMonthlyUsd.toFixed(2)}
                          </div>
                          <div className={cn("text-xs mt-1", isDark ? "text-white/60" : "text-muted-foreground")}>
                            ₹{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(discountedMonthlyInr))} /mo • {billedText}
                          </div>
                          {billing === "annual" && (
                            <div className={cn("text-xs mt-1", isDark ? "text-amber-300/90" : "text-amber-700")}>
                              ₹{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(annualTotalInr))} /year • save 10%
                            </div>
                          )}
                        </div>
                        <div className={cn("text-xs pb-1 text-right", isDark ? "text-white/60" : "text-muted-foreground")}>/mo</div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing || isCurrent || !canCheckout}
                        onClick={() => (isCurrent || !canCheckout ? undefined : handleGetStarted(plan.name))}
                        className={cn(
                          "w-full rounded-xl py-2.5 text-sm font-bold transition-colors border flex items-center justify-center gap-2",
                          isCurrent
                            ? isDark ? "bg-white/10 border-white/10 text-white/80" : "bg-muted border-border text-muted-foreground"
                            : highlight
                              ? isDark ? "bg-amber-400 text-black border-amber-400 hover:bg-amber-300" : "bg-foreground text-background border-foreground hover:opacity-90"
                              : isDark ? "bg-white text-black border-white hover:bg-white/90" : "bg-background text-foreground border-border hover:bg-muted",
                          !canCheckout ? "opacity-70 cursor-not-allowed" : ""
                        )}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {!canCheckout ? "Loading..." : isCurrent ? "Current Plan" : plan.name === "INDIE" ? "Get Standard" : plan.name === "PRO" ? "Get Pro" : "Get Ultra"}
                      </button>

                      <div className="space-y-2 pt-1">
                        {plan.features.slice(0, 6).map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <Check className={cn("h-4 w-4 mt-0.5", isDark ? "text-white/80" : "text-foreground")} />
                            <div className={cn("text-xs leading-relaxed", isDark ? "text-white/70" : "text-foreground")}>{feature}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {error && (
                <div className={cn("mt-4 rounded-xl border px-4 py-3 text-sm", isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-500/30 bg-red-500/10 text-red-700")}>
                  {error}
                </div>
              )}

              <div className={cn("mt-6 rounded-2xl border p-4 flex items-center justify-between", isDark ? "border-white/10 bg-white/[0.03]" : "border-border bg-card")}>
                <div className="flex items-center gap-3">
                  <Crown className={cn("h-4 w-4", isDark ? "text-amber-300" : "text-amber-600")} />
                  <div className="text-sm font-semibold">Secure checkout</div>
                </div>
                <div className={cn("text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>
                  Payments handled by Razorpay
                </div>
              </div>

              <div className={cn("mt-6 rounded-2xl border p-5", isDark ? "border-white/10 bg-white/[0.03]" : "border-border bg-card")}>
                <div className="text-sm font-semibold">FAQ</div>
                <div className={cn("mt-1 text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>
                  Quick answers about billing, credits, and plan changes.
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    {
                      q: "What does “credits” mean?",
                      a: "Credits are used for generation features (chat, images, 3D, video, audio). Your monthly credits refresh based on your plan.",
                    },
                    {
                      q: "Can I cancel anytime?",
                      a: "Yes. You can cancel your subscription and keep access until your current billing period ends.",
                    },
                    {
                      q: "How does Annual billing work?",
                      a: "Annual billing pre-pays 12 months and applies a 10% discount compared to paying monthly.",
                    },
                    {
                      q: "Can I upgrade or downgrade later?",
                      a: "Yes. You can switch plans any time. Changes typically apply immediately or at the next renewal depending on the plan.",
                    },
                    {
                      q: "Is payment secure?",
                      a: "Yes. Payments are processed by Razorpay. KOYE AI does not store your card details.",
                    },
                  ].map((item) => (
                    <details
                      key={item.q}
                      className={cn("group rounded-xl border px-4 py-3", isDark ? "border-white/10 bg-black/10" : "border-border bg-background")}
                    >
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{item.q}</div>
                        <div className={cn("text-xs font-black px-2 py-1 rounded-full", isDark ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground")}>
                          +
                        </div>
                      </summary>
                      <div className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-white/70" : "text-muted-foreground")}>
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
