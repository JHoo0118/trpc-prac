import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type SpinnerProps = HTMLAttributes<HTMLDivElement>;

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800 dark:border-neutral-800 dark:border-t-neutral-200",
        className,
      )}
      {...props}
    />
  );
}

export default Spinner;
