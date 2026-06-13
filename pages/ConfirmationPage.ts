import { Page, Locator } from '@playwright/test'

export class ConfirmationPage {
  readonly page: Page
  readonly confirmationMessage: Locator
  readonly totalText: Locator
  readonly backToProductsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.confirmationMessage = page.getByTestId('confirmation-message')
    this.totalText = page.getByTestId('confirmation-total')
    this.backToProductsLink = page.getByTestId('confirmation-back-to-products')
  }

  async getTotal(): Promise<string> {
    return (await this.totalText.textContent()) ?? ''
  }

  async getMessage(): Promise<string> {
    return (await this.confirmationMessage.textContent()) ?? ''
  }

  async goBackToProducts(): Promise<void> {
    await this.backToProductsLink.click()
    await this.page.waitForURL('**/products')
  }

  async isAt(): Promise<boolean> {
    return this.page.url().includes('/confirmation')
  }
}
