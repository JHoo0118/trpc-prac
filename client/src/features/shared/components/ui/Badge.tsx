import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
