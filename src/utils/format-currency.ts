const formatCurrencyINR = (num: number) => {
  const number = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return number.format(num);
};

export default formatCurrencyINR;
