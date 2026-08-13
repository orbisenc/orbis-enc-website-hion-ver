export function calculateExecutionRate(executedWon: bigint, approvedWon: bigint) {
  if (approvedWon <= 0n) return 0;
  return Number(executedWon * 10_000n / approvedWon) / 100;
}
