import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;
  readonly backToProductsLink: Locator;
  readonly cartBadge: Locator;
  private readonly main: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.items = this.main.getByRole('listitem');
    this.total = this.main.locator('.total');
    this.emptyMessage = this.main.getByText('Seu carrinho está vazio.');
    this.backToProductsLink = this.main.getByRole('link', { name: 'Ver produtos' });
    this.cartBadge = page.getByRole('link', { name: 'Carrinho' }).locator('.mat-badge-content');
  }

  async goto(): Promise<void> {
    await this.page.goto('/store/cart');
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  quantity(name: string): Locator {
    return this.main.getByRole('status', { name: `Quantidade de ${name}` });
  }

  async increase(name: string): Promise<void> {
    await this.main.getByRole('button', { name: `Aumentar quantidade de ${name}` }).click();
  }

  async decrease(name: string): Promise<void> {
    await this.main.getByRole('button', { name: `Diminuir quantidade de ${name}` }).click();
  }

  async remove(name: string): Promise<void> {
    await this.main.getByRole('button', { name: `Remover ${name}` }).click();
  }
}
