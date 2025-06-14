import { format, isToday, isYesterday } from "date-fns";

// 🕒 Format message time like "08:35 PM"
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// 📅 Format date label: "Today", "Yesterday", or "12 Jun 2025"
export function formatMessageDateLabel(date) {
  const messageDate = new Date(date);
  if (isToday(messageDate)) return "Today";
  if (isYesterday(messageDate)) return "Yesterday";
  return format(messageDate, "dd MMM yyyy"); // e.g., 12 Jun 2025
}
