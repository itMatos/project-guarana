import type { Product, ProductCategory } from '../../app/shared/models/product.model';
import { MOCK_PRODUCTS } from '../../mocks/data/products';

export class ProductBuilder {
  private readonly product: Product = structuredClone(MOCK_PRODUCTS[0]);

  withId(id: number): this {
    this.product.id = id;
    return this;
  }

  withName(name: string): this {
    this.product.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.product.description = description;
    return this;
  }

  withPrice(price: number): this {
    this.product.price = price;
    return this;
  }

  withCategory(category: ProductCategory): this {
    this.product.category = category;
    return this;
  }

  build(): Product {
    return structuredClone(this.product);
  }
}

export const aProduct = (): ProductBuilder => new ProductBuilder();
