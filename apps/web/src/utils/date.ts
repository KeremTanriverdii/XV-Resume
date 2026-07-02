/**
 * Formats an ISO date string strictly into dd/mm/yyyy format.
 * Returns empty string or fallback text if input is null or invalid.
 */
export const formatDate = (dateStr: string | null | undefined, fallback: string = ""): string => {
  if (!dateStr) return fallback;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallback;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
