export function toFixed(num: unknown, n: number): number {
  if (typeof n !== 'number' || n < 0) {
    throw new Error('Decimal places (n) must be a non-negative number.');
  }

  const _num = Number(num);
  if (isNaN(_num)) {
    throw new Error('Input must be a valid number.');
  }

  const pow = Math.pow(10, n);
  return Math.round(_num * pow) / pow;
}
