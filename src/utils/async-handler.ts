/* =====================
   ASYNC HANDLER
===================== */

export function asyncHandler<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
) {
  return async function (...args: TArgs): Promise<TReturn> {
    try {
      const res = await fn(...args);
      return res;
    } catch (error) {
      console.log('// ======= || Error || ======== //\n', error);
      throw error;
    }
  };
}
