import React from "react"
import { usePricing } from "../../hooks/usePricing"
import { useTheme } from "../theme-provider"

interface AppIconProps {
  className?: string
  imgClassName?: string
  forcePro?: boolean
  forceDefault?: boolean
  alt?: string
}

export const AppIcon: React.FC<AppIconProps> = ({
  className = "h-12 w-12",
  imgClassName = "",
  forcePro = false,
  forceDefault = false,
  alt = "KOYE AI",
}) => {
  const { subscription } = usePricing({ includeUsage: false })
  const { theme } = useTheme()

  // Determine if user has a Pro/Studio tier subscription
  const isPro =
    forcePro ||
    (!forceDefault &&
      subscription &&
      subscription.status === "active" &&
      ["PRO", "PRO_PLUS", "STUDIO", "CUSTOM"].includes(subscription.planName))

  const iconSrc = "/images/app/new-icon2.png"

  // This icon does not need the filter change when the app changes theme
  const filterStyle = undefined

  return (
    <div className={`relative overflow-hidden shrink-0 flex items-center justify-center ${className}`}>
      <img
        src={iconSrc}
        alt={alt}
        className={`w-full h-full object-cover select-none ${imgClassName}`}
        style={filterStyle}
      />
    </div>
  )
}
