/** Format a percentage score to one decimal place */
export const fmtPercent = (value: number) => `${value.toFixed(1)}%`

/** Format a date string to a readable format */
export const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

/** Map a risk score (0-100) to a risk level label */
export const scoreToLevel = (score: number): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' => {
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  if (score > 0)   return 'LOW'
  return 'NONE'
}
