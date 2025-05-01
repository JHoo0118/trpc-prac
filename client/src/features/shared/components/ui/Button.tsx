import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...props}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  );
}

export const buttonVariants = cva(
  "flex flex-row items-center justify-center gap-2 rounded-md font-semibold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "from-primary-500 to-secondary-500 hover:from-primary-500/70 hover:to-secondary-500/70 bg-gradient-to-r text-neutral-900 hover:bg-gradient-to-r",
        outline:
          "border border-neutral-200 hover:bg-neutral-200 hover:text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        ghost:
          "bg-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "bg-transparent hover:opacity-70",
        destructive: "bg-red-500 p-4 text-white hover:bg-red-500/70",
        "destructive-link": "text-red-500 hover:text-red-500/70",
      },
      size: {
        default: "h-10 px-4 py-2",
      },
    },
    compoundVariants: [
      {
        variant: ["link", "destructive-link"],
        size: "default",
        class: "h-auto p-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
