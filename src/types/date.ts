type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type zeroToNine = 0 | oneToNine;
/* Years */
export type YYYY = `${0 | 1 | 2}${zeroToNine}${zeroToNine}${zeroToNine}`;
// type YYYY = `19${zeroToNine}${zeroToNine}` | `20${zeroToNine}${zeroToNine}`

/* Months */
export type MM = `0${oneToNine}` | `1${0 | 1 | 2}`;
/* Days */
export type DD = `${0}${oneToNine}` | `${1 | 2}${zeroToNine}` | `3${0 | 1}`;
/* time */
export type HH =
  | `${0}${zeroToNine}`
  | `${1}${zeroToNine}`
  | `2${0 | 1 | 2 | 3}`;
export type mm = `${0 | 1 | 2 | 3 | 4 | 5}${zeroToNine}`;

/* YYYY-MM-DD HH:mm */
/* tells ts to ignore `Expression produces a union type that is too complex to represent.ts(2590)` */
// @ts-ignore
export type Date = `${YYYY}-${MM}-${DD}`;
// @ts-ignore
export type DateTime = `${YYYY}-${MM}-${DD} ${HH}:${mm}`;
