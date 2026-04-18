import { clsx } from "clsx";

export function StatusChip({
  status
}: {
  status: "not_started" | "saved" | "completed" | "vip";
}) {
  const label = {
    not_started: "Not started",
    saved: "Saved",
    completed: "Completed",
    vip: "VIP"
  }[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold",
        status === "not_started" && "bg-paper text-ink/70",
        status === "saved" && "bg-river text-white",
        status === "completed" && "bg-leaf text-white",
        status === "vip" && "bg-sun text-ink"
      )}
    >
      {label}
    </span>
  );
}
