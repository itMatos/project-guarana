import { Product } from './product.model';

export const MAX_QUANTITY_PER_PRODUCT = 10;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface AddCartItemRequest {
  productId: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
