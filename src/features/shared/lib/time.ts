export function phTime(time: string | null) {
  if (!time) return "-";

  return new Date(time).toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function phNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
}