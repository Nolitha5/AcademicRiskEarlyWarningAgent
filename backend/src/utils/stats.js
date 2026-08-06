/** Calculate the arithmetic mean of an array of numbers */
export const mean = (nums) => nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0

/** Calculate attendance percentage from attended vs total sessions */
export const attendancePct = (attended, total) => total > 0 ? (attended / total) * 100 : 0

/** Count how many items fail a predicate */
export const countFailing = (items, predicate) => items.filter(predicate).length
