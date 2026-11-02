export const API = {
  login: '**/api/auth/login',
  products: '**/api/products',
  cart: '**/api/cart',
  cartItems: '**/api/cart/items',
  cartItem: '**/api/cart/items/*',
  any: '**/api/**'
} as const;
