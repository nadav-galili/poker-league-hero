export const formatCurrency = (amount: number | string | undefined | null) => {
   if (amount === null || amount === undefined) {
      return '₪0.00';
   }

   // Convert to number if it's a string
   const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

   // Check if the conversion resulted in NaN
   if (isNaN(numAmount)) {
      return '₪0.00';
   }

   return `₪${numAmount.toFixed(2)}`;
};

export const formatDuration = (minutes: number) => {
   const hours = Math.floor(minutes / 60);
   const mins = minutes % 60;
   if (hours > 0) {
      return `${hours}h ${mins}m`;
   }
   return `${mins}m`;
};
