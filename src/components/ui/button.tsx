import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Add variant-specific styling
    let variantClasses = "";
    if (variant === "outline") {
      variantClasses = "bg-transparent border border-current";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent hover:bg-gray-100";
    } else {
      variantClasses = "bg-primary text-primary-foreground hover:bg-primary/90";
    }
    
    // Add size-specific styling
    let sizeClasses = "";
    if (size === "sm") {
      sizeClasses = "h-9 px-3 text-sm";
    } else if (size === "lg") {
      sizeClasses = "h-11 px-8 text-lg";
    } else {
      sizeClasses = "h-10 px-4 py-2";
    }
    
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${variantClasses} ${sizeClasses} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
