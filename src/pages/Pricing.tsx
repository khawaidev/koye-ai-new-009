import { CheckCircle, Crown, Loader2, Sparkles, StarIcon, X } from "lucide-react"
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
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly")

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

  const landingPagePlans = [
    {
      name: 'Indie',
      info: 'For students & hobbyists',
      price: { monthly: 5, yearly: 54 },
      features: [
        { text: '500 credits/month' },
        { text: 'No commercial license' },
        { text: 'Community support' },
        { text: 'Standard priority' },
        { text: '5GB storage' },
      ],
      btn: { text: 'Select Plan', href: '/signup' },
      highlighted: false,
    },
    {
      name: 'Pro',
      info: 'For indie developers',
      price: { monthly: 20, yearly: 216 },
      features: [
        { text: '3,000 credits/month' },
        { text: 'Commercial license' },
        { text: 'Unity/Unreal helpers' },
        { text: 'Full export options' },
        { text: '20GB storage' },
      ],
      btn: { text: 'Select Plan', href: '/signup' },
      highlighted: true,
    },
    {
      name: 'Pro Plus',
      info: 'For small teams',
      price: { monthly: 35, yearly: 378 },
      features: [
        { text: '8,000 credits/month' },
        { text: 'High priority queue' },
        { text: '100GB storage' },
        { text: 'Early access features' },
        { text: 'AI code generation' },
      ],
      btn: { text: 'Select Plan', href: '/signup' },
      highlighted: false,
    },
  ];

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

    const dbPlanName = planNameMap[planName.toUpperCase()]
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
      const selectedPlan = landingPagePlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
      if (!selectedPlan) {
        throw new Error("Selected plan not found in landing page plans.");
      }

      const amountUsd = frequency === "monthly" ? selectedPlan.price.monthly : selectedPlan.price.yearly;
      const amountInr = amountUsd * 83; // Assuming 1 USD = 83 INR for conversion
      const amountInPaise = Math.round(amountInr * 100);

      const iconUrl = new URL("/images/app/new-icon2.png", window.location.origin).href

      await openRazorpayCheckout(
        {
          amount: amountInPaise,
          currency: "INR",
          name: "KOYE AI",
          description: `${frequency === "yearly" ? "Annual" : "Monthly"} subscription to ${selectedPlan.name}`,
          image: iconUrl,
          prefill: {
            name: user.email?.split("@")[0] || "User",
            email: user.email || undefined,
          },
          notes: {
            plan_id: dbPlan.id,
            plan_name: dbPlan.name,
            user_id: user.id,
            billing_cycle: frequency,
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
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0a0a0b] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Soft blurred transition from top */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 via-[#0a0a0b]/50 to-transparent pointer-events-none z-10" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <div>
                  <div className="font-semibold text-white">Upgrade Your Plan</div>
                  <div className="text-xs mt-0.5 text-white/60">
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

            <div className="px-6 py-4 flex items-center justify-center relative z-10">
              <div className="bg-muted/30 inline-flex rounded-full border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setFrequency("monthly")}
                  className="relative px-5 py-1.5 text-sm capitalize"
                >
                  <span className={`relative z-10 ${frequency === "monthly" ? "text-background" : "text-white/80"}`}>Monthly</span>
                  {frequency === "monthly" && (
                    <motion.span
                      layoutId="billing-pill"
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="bg-foreground absolute inset-0 z-0 rounded-full"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("yearly")}
                  className="relative px-5 py-1.5 text-sm capitalize flex items-center gap-2"
                >
                  <span className={`relative z-10 ${frequency === "yearly" ? "text-background" : "text-white/80"}`}>Annual</span>
                  {frequency === "yearly" && (
                    <motion.span
                      layoutId="billing-pill"
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="bg-foreground absolute inset-0 z-0 rounded-full"
                    />
                  )}
                  {frequency === "yearly" && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 relative z-10">
                      SAVE 10%
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {landingPagePlans.map((plan) => {
                  const dbPlanName = planNameMap[plan.name.toUpperCase()]
                  const dbPlan = dbPlans.find((p) => p.name === dbPlanName)
                  const isCurrent = !!subscription && subscription.planName === dbPlanName && subscription.status === "active"
                  const isProcessing = processingPlan === plan.name
                  const price = frequency === 'monthly' ? plan.price.monthly : plan.price.yearly;
                  const billedText = frequency === "yearly" ? "billed annually" : "billed monthly"
                  const canCheckout = !!dbPlan && !pricingLoading

                  return (
                    <div
                      key={plan.name}
                      className={`relative flex flex-col rounded-lg border bg-muted/20 p-5 ${
                        plan.highlighted ? 'bg-muted/40 border-amber-500/50' : 'border-border/60'
                      }`}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <p className="bg-foreground text-background flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-bold">
                            <StarIcon className="h-3 w-3 fill-current" />
                            Popular
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="text-lg font-medium text-foreground">{plan.name}</div>
                        <div className="text-muted-foreground text-sm">{plan.info}</div>
                        <h3 className="mt-2 flex items-end gap-1 text-foreground">
                          <span className="text-3xl font-bold">${price}</span>
                          <span className="text-muted-foreground text-sm">/{frequency === 'monthly' ? 'month' : 'year'}</span>
                        </h3>
                        <div className="text-xs text-white/60 mt-1">
                          {billedText}
                        </div>
                        {frequency === "yearly" && (
                          <div className="text-xs mt-1 text-amber-300/90">
                            Save 10%
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3 mb-5">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle className="h-4 w-4 text-foreground shrink-0" />
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing || isCurrent || !canCheckout}
                        onClick={() => (isCurrent || !canCheckout ? undefined : handleGetStarted(plan.name))}
                        className={`w-full py-2.5 text-sm font-semibold rounded-lg text-center transition-colors ${
                          isCurrent
                            ? 'bg-foreground/10 border border-foreground/10 text-foreground/80'
                            : plan.highlighted
                              ? 'bg-foreground text-background hover:opacity-90'
                              : 'border border-border/80 text-foreground bg-background/50 hover:bg-background/80'
                        } ${!canCheckout ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {!canCheckout ? "Loading..." : isCurrent ? "Current Plan" : plan.btn.text}
                      </button>
                    </div>
                  )
                })}
              </div>

              {error && (
                <div className={cn("mt-4 rounded-xl border px-4 py-3 text-sm", isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-500/30 bg-red-500/10 text-red-700")}>
                  {error}
                </div>
              )}

              <div className="mt-6 rounded-lg border border-border/60 bg-muted/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-amber-300" />
                  <div className="text-sm font-semibold text-white">Secure checkout</div>
                </div>
                <div className="text-xs text-white/60">
                  Payments handled by Razorpay
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-border/60 bg-muted/20 p-5">
                <div className="text-sm font-semibold text-white">FAQ</div>
                <div className="mt-1 text-xs text-white/60">
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
                      className="group rounded-xl border border-border/60 bg-black/10 px-4 py-3"
                    >
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{item.q}</div>
                        <div className="text-xs font-black px-2 py-1 rounded-full bg-white/10 text-white/70">
                          +
                        </div>
                      </summary>
                      <div className="mt-2 text-sm leading-relaxed text-white/70">
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
