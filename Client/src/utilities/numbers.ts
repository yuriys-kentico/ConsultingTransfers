export const isDigitsOptionallyDotAndDecimals = (value: string, decimals: number) =>
  new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`).test(value);

export const isDigitsWithATrailingDotOrZero = (value: string) => !/^\d*?\.0?$/.test(value);

export const toRounded = (value: number, decimals: number = 0) =>
  Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);

export const toNumber = (value: string) => parseFloat(value);

export const toBetween = (value: number, max: number, min: number) => Math.max(Math.min(value, max), min);

export const ensureBetween = (value: string, max: number, min: number) => {
  const tempValue = toNumber(value);

  if (!isNaN(tempValue) && (tempValue > max || tempValue < min)) {
    return toBetween(tempValue, max, min).toString();
  }

  return value;
};

export const toHex = (value: number, size: number = 2) => value.toString(16).padStart(size, '0');
export const isHexOneChar = (value: number) => (value || 0) % 17 === 0;
export const is4HexNumbers = (value: string) => /^([0-9a-fA-F][0-9a-fA-F]){3,4}$|^[0-9a-fA-F]{3,4}$|^$/.test(value);
export const is3HexNumbers = (value: string) => /^([0-9a-fA-F][0-9a-fA-F]){3}$|^[0-9a-fA-F]{3}$|^$/.test(value);

export const getSizeText = (sizeInBytes: number | undefined, decimals: number = 0): [number, string] => {
  let unit = 'B';

  if (sizeInBytes) {
    let finalSize = sizeInBytes;

    // Gigabytes
    if (sizeInBytes > 1024 * 1024 * 1024) {
      finalSize = sizeInBytes / 1024 / 1024 / 1024;
      unit = 'GB';
    }
    // Megabytes
    else if (sizeInBytes > 1024 * 1024) {
      finalSize = sizeInBytes / 1024 / 1024;
      unit = 'MB';
    }
    // Kilobytes
    else if (sizeInBytes > 1024) {
      finalSize = sizeInBytes / 1024;
      unit = 'KB';
    }

    return [toRounded(finalSize, decimals), unit];
  }

  return [0, unit];
};
