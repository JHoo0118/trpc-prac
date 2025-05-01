import { cn } from "@/lib/utils/cn";

import { useFormField } from "./Form";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  const { error } = useFormField();

  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded border border-neutral-200 bg-neutral-200 p-2 dark:border-neutral-800 dark:bg-neutral-950",
        "focus:border-neutral-400 focus:outline-none dark:focus:border-neutral-600",
        error &&
          "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500",
        className,
      )}
    />
  );
}
