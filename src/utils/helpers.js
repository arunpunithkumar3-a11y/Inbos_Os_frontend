
export function formatDate(dateStr) {
  if (!dateStr) return "";
  let utcStr = dateStr;
  if (
    typeof dateStr === "string" &&
    !dateStr.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(dateStr)
  ) {
    utcStr = dateStr.replace(" ", "T") + "Z";
  }
  const d = new Date(utcStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
