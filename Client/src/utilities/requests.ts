export const getAuthorizationHeaders = (key: string, bearerToken?: string) => {
  return bearerToken
    ? {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'x-functions-key': key
        }
      }
    : {
        headers: {
          'x-functions-key': key
        }
      };
};
