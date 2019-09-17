export const promiseWhile = <T>(
  data: T,
  condition: (data: T) => boolean,
  action: (data: T) => Promise<T>
): Promise<T> => {
  const whilst = (data: T): Promise<T> => {
    return condition(data) ? action(data).then(whilst) : Promise.resolve(data);
  };

  return whilst(data);
};

export const promiseAfter = (timeout: number) => async <T>(data: T) => {
  await new Promise(resolve => setTimeout(resolve, timeout));

  return data;
};
