"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#1F2937]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-green-400 to-purple-600" />
    </SliderPrimitive.Track>
    {/* Primer thumb en verde sin animación */}
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full bg-green-400 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-green-400 disabled:pointer-events-none disabled:opacity-50" />
    {/* Segundo thumb en púrpura sin animación */}
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full bg-purple-600 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-purple-600 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
