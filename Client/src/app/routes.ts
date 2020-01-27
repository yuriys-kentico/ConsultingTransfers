export const routes = {
  home: '/',
  transfers: '/transfers',
  newTransfer: '/transfers/new',
  transfer: '/transfer/',
  details: '/details/',
  error: '/error'
};

export const shouldAuthenticateRoute = (path: string) => {
  switch (path) {
    case routes.home:
    case routes.transfers:
    case routes.newTransfer:
      return true;

    default:
      return false;
  }
};
