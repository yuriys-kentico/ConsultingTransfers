export const toRounded = (value: number, decimals: number = 0) =>
  Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);

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
