import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]",
        secondary:
          "border border-[var(--border-strong)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
        danger:
          "bg-[var(--destructive)] text-white hover:opacity-90",
        outline:
          "border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--gm-green-soft)]",
      },
      size: {
        sm: "h-9 px-4 text-[14px]",
        md: "h-10 px-5 text-[15px]",
        lg: "h-[52px] px-6 text-[17px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    icon?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: Props) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

export { buttonVariants };
