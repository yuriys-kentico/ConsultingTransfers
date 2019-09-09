export const deleteFrom = <T>(items: T[] | T, array: T[]) => {
  let itemsToDelete: T[];

  if (Array.isArray(items)) {
    itemsToDelete = items;
  } else {
    itemsToDelete = [items];
  }

  return array.filter(item => !itemsToDelete.includes(item));
};
