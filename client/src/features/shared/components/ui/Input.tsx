import { cn } from "@/lib/utils/cn";

import { useFormField } from "./Form";

const baseInputClasses =
  "w-full rounded placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-200 p-2 dark:border-neutral-800 focus:border-neutral-400 focus:outline-none dark:focus:border-neutral-600 bg-neutral-200 dark:bg-neutral-950";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?:
    | React.RefObject<HTMLInputElement | null>
    | React.RefCallback<HTMLInputElement | null>;
};

export default function Input({ className, ...props }: InputProps) {
  const { error } = useFormField();

  return (
    <input
      {...props}
      className={cn(
        baseInputClasses,
        error &&
          "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500",
        className,
      )}
    />
  );
}

export function RawInput({ className, ...props }: InputProps) {
  return <input {...props} className={cn(baseInputClasses, className)} />;
}
