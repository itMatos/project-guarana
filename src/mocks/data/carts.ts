import { Cart, MAX_QUANTITY_PER_PRODUCT } from '../../app/shared/models/cart.model';
import { MOCK_PRODUCTS } from './products';

/**
 * Carrinhos do mock, por usuário. O MSW roda no navegador e perde a memória a cada F5,
 * então os carrinhos ficam no localStorage para sobreviver ao recarregamento e ao logout.
 */
const STORAGE_KEY = 'guarana-mock-carts';

interface StoredItem {
  productId: number;
  quantity: number;
}

type StoredCarts = Record<string, StoredItem[]>;

function readAll(): StoredCarts {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredCarts;
  } catch {
    return {};
  }
}

function readItems(username: string): StoredItem[] {
  return readAll()[username] ?? [];
}

function writeItems(username: string, items: StoredItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [username]: items }));
}

/** Monta o carrinho com os dados atuais de cada produto (inclusive o preço). */
export function getMockCart(username: string): Cart {
  return {
    items: readItems(username).flatMap(({ productId, quantity }) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      return product ? [{ product: structuredClone(product), quantity }] : [];
    })
  };
}

export function mockProductExists(productId: number): boolean {
  return MOCK_PRODUCTS.some((product) => product.id === productId);
}

export function mockCartQuantity(username: string, productId: number): number {
  return readItems(username).find((item) => item.productId === productId)?.quantity ?? 0;
}

export function setMockCartQuantity(username: string, productId: number, quantity: number): void {
  const items = readItems(username);
  const index = items.findIndex((item) => item.productId === productId);
  // Troca no lugar, para a lista não "pular" quando a quantidade muda.
  if (index === -1) {
    items.push({ productId, quantity });
  } else {
    items[index] = { productId, quantity };
  }
  writeItems(username, items);
}

export function removeMockCartItem(username: string, productId: number): void {
  writeItems(
    username,
    readItems(username).filter((item) => item.productId !== productId)
  );
}

export function isValidQuantity(quantity: unknown): quantity is number {
  return Number.isInteger(quantity) && (quantity as number) >= 1 && (quantity as number) <= MAX_QUANTITY_PER_PRODUCT;
}
