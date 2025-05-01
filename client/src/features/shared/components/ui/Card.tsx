import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
