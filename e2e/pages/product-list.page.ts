import type { Locator, Page } from '@playwright/test';

export class ProductListPage {
  readonly logoutButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly addToCartButtons: Locator;
  private readonly list: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = page.getByRole('button', { name: 'Sair' });
    this.cartLink = page.getByRole('link', { name: 'Carrinho' });
    this.cartBadge = this.cartLink.locator('.mat-badge-content');
    this.list = page.getByRole('main');
    // Cada produto renderiza exatamente um botão: serve para contar os itens.
    // Só a aba ativa fica no DOM, então a contagem é da categoria selecionada.
    this.addToCartButtons = this.list.getByRole('button', { name: 'Adicionar ao Carrinho' });
  }

  async goto(category?: string): Promise<void> {
    await this.page.goto(category ? `/store/products?categoria=${category}` : '/store/products');
  }

  /** Aba de categoria pelo rótulo visível (o contador entre parênteses é ignorado). */
  categoryTab(label: string): Locator {
    return this.list.getByRole('tab', { name: new RegExp(`^${label}\\b`) });
  }

  emptyCategoryMessage(label: string): Locator {
    return this.list.getByText(`Nenhum produto em ${label} no momento.`);
  }

  async selectCategory(label: string): Promise<void> {
    await this.categoryTab(label).click();
  }

  async addToCart(name: string): Promise<void> {
    await this.list.locator('mat-card').filter({ hasText: name }).getByRole('button', { name: 'Adicionar ao Carrinho' }).click();
  }

  product(name: string): Locator {
    return this.list.getByText(name, { exact: true });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
