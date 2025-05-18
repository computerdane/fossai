import { clsx } from "clsx";

type SpinnerProps = {
  className?: string;
  fullPage?: boolean;
};

export default function Spinner({ className, fullPage = true }: SpinnerProps) {
  return (
    <div
      className={clsx(
        fullPage && "fixed inset-0 z-50 flex items-center justify-center",
        !fullPage && "inline-flex items-center justify-center",
        className,
      )}
    >
      <div className="animate-spin rounded-full border-4 border-(--accent-9)/20 border-t-(--accent-9) size-12" />
    </div>
  );
}
