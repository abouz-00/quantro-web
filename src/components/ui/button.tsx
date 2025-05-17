import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Use more standard Tailwind classes that are definitely defined
    let variantClasses = "";
    if (variant === "outline") {
      variantClasses = "bg-transparent border border-gray-300";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent hover:bg-gray-100";
    } else {
      variantClasses = "bg-violet-500 text-white hover:bg-violet-600";
    }
    
    let sizeClasses = "";
    if (size === "sm") {
      sizeClasses = "py-1 px-3 text-sm";
    } else if (size === "lg") {
      sizeClasses = "py-3 px-8 text-lg";
    } else {
      sizeClasses = "py-2 px-4";
    }
    
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
