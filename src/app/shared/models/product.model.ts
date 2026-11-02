export type ProductCategory = 'celulares' | 'notebooks' | 'tablets';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

export const PRODUCT_CATEGORIES: readonly { id: ProductCategory; label: string }[] = [
  { id: 'celulares', label: 'Celulares' },
  { id: 'notebooks', label: 'Notebooks' },
  { id: 'tablets', label: 'Tablets' }
];
