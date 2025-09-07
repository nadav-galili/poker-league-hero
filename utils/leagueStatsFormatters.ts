export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₪0.00";
  }
  return `₪${amount.toFixed(2)}`;
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};