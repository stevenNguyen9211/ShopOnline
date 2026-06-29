import { Page, Locator } from '@playwright/test'

export class ConfirmationPage {
  readonly page: Page
  readonly orderIdText: Locator
  readonly totalText: Locator
  readonly backToProductsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.orderIdText = page.getByTestId('checkout-success-order-id')
    this.totalText = page.getByTestId('checkout-success-total')
    this.backToProductsLink = page.getByTestId('confirmation-back-to-products')
  }

  async getOrderId(): Promise<string> {
    return (await this.orderIdText.textContent()) ?? ''
  }

  async getTotal(): Promise<string> {
    return (await this.totalText.textContent()) ?? ''
  }

  async goBackToProducts(): Promise<void> {
    await this.backToProductsLink.click()
    await this.page.waitForURL('**/products')
  }

  async isAt(): Promise<boolean> {
    return this.page.url().includes('/confirmation')
  }
}
