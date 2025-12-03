const EPSILON = 0.000000001;

export const areEqual = (one, other, epsilon = EPSILON) =>
  Math.abs(one - other) < epsilon;

export const isNearlyZero = v => Math.abs(v) < EPSILON;

export const sum = arr => arr.reduce((acc, value) => acc + value, 0);

export const withoutElementAtIndex = (arr, index) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
];