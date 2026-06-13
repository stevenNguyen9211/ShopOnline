import { Page, Locator } from '@playwright/test'

export class ProductsPage {
  readonly page: Page
  readonly productsGrid: Locator

  constructor(page: Page) {
    this.page = page
    this.productsGrid = page.getByTestId('products-grid')
  }

  productCard(productId: string): Locator {
    return this.page.getByTestId(`product-card-${productId}`)
  }

  productName(productId: string): Locator {
    return this.productCard(productId).getByTestId('product-name')
  }

  productPrice(productId: string): Locator {
    return this.productCard(productId).getByTestId('product-price')
  }

  productImage(productId: string): Locator {
    return this.productCard(productId).getByTestId('product-image')
  }

  addToCartButton(productId: string): Locator {
    return this.productCard(productId).getByTestId('add-to-cart')
  }

  async getProductCount(): Promise<number> {
    return this.productsGrid.locator('[data-testid^="product-card-"]').count()
  }

  async getProductName(productId: string): Promise<string> {
    return (await this.productName(productId).textContent()) ?? ''
  }

  async getProductPrice(productId: string): Promise<string> {
    return (await this.productPrice(productId).textContent()) ?? ''
  }

  async addToCart(productId: string): Promise<void> {
    await this.addToCartButton(productId).click()
  }

  async isAddToCartDisabled(productId: string): Promise<boolean> {
    return this.addToCartButton(productId).isDisabled()
  }

  async getCartCount(): Promise<string> {
    return (await this.page.getByTestId('header-cart-count').textContent()) ?? '0'
  }

  async goToCart(): Promise<void> {
    await this.page.getByTestId('header-cart-link').click()
    await this.page.waitForURL('**/cart')
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('header-logout').click()
    await this.page.waitForURL('**/login')
  }

  async getHeaderUsername(): Promise<string> {
    return (await this.page.getByTestId('header-user-name').textContent()) ?? ''
  }
}
