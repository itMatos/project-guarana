import type { Locator, Page } from '@playwright/test';

export class ProductListPage {
  readonly logoutButton: Locator;
  readonly addToCartButtons: Locator;
  private readonly list: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = page.getByRole('button', { name: 'Sair' });
    this.list = page.getByRole('main');
    // Cada produto renderiza exatamente um botão: serve para contar os itens.
    this.addToCartButtons = this.list.getByRole('button', { name: 'Adicionar ao Carrinho' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/store/products');
  }

  product(name: string): Locator {
    return this.list.getByText(name, { exact: true });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
