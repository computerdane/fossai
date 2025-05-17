import { clsx } from "clsx";

type SpinnerProps = {
  size?: number;
  className?: string;
  fullPage?: boolean;
};

export default function Spinner({
  size = 12,
  className,
  fullPage = true,
}: SpinnerProps) {
  const sizeClass = `h-${size} w-${size}`;

  return (
    <div
      className={clsx(
        fullPage && "fixed inset-0 z-50 flex items-center justify-center",
        !fullPage && "inline-flex items-center justify-center",
        className
      )}
    >
      <div
        className={clsx(
          sizeClass,
          "animate-spin rounded-full border-4 border-white/20 border-t-white"
        )}
      />
    </div>
  );
}
