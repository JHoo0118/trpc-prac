import * as ProgressPrimitive from "@radix-ui/react-progress";
import { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root>;

const Progress = ({ className, value, ...props }: ProgressProps) => (
  <ProgressPrimitive.Root
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="dark:bg-primary-500 bg-secondary-500 h-full w-full flex-1 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);

export { Progress };
