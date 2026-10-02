const apiUrl = '/api';

export const environment = {
  useMocks: true,
  apiEndpoints: {
    auth: {
      login: `${apiUrl}/auth/login`,
      logout: `${apiUrl}/auth/logout`
    },
    user: {
      user: `${apiUrl}/user`
    },
    product: {
      products: `${apiUrl}/products`
    }
  }
};
