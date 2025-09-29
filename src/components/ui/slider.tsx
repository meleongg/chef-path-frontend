"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: "primary" | "accent" | "secondary";
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      color = "primary",
      ...props
    },
    ref
  ) => {
    const percentage =
      ((value - (min || 0)) / ((max || 100) - (min || 0))) * 100;

    const colorClasses = {
      primary: "slider-primary",
      accent: "slider-accent",
      secondary: "slider-secondary",
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            colorClasses[color],
            className
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--${color})) 0%, hsl(var(--${color})) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
          }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
