import type { ValueTransformer } from 'typeorm';

/**
 * MySQL returns DECIMAL columns as strings to avoid precision loss.
 * The values stored here (km, kg, min/km) fit comfortably in a JS number.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? null : Number(value),
};
