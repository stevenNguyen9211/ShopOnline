import { Page, Locator } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page
  readonly fullnameInput: Locator
  readonly fullnameError: Locator
  readonly postalcodeInput: Locator
  readonly postalcodeError: Locator
  readonly totalText: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.fullnameInput = page.getByTestId('checkout-fullname')
    this.fullnameError = page.getByTestId('checkout-fullname-error')
    this.postalcodeInput = page.getByTestId('checkout-postalcode')
    this.postalcodeError = page.getByTestId('checkout-postalcode-error')
    this.totalText = page.getByTestId('checkout-total')
    this.submitButton = page.getByTestId('checkout-submit')
  }

  async fillFullname(name: string): Promise<void> {
    await this.fullnameInput.clear()
    await this.fullnameInput.fill(name)
  }

  async fillPostalcode(code: string): Promise<void> {
    await this.postalcodeInput.clear()
    await this.postalcodeInput.fill(code)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async getTotal(): Promise<string> {
    return (await this.totalText.textContent()) ?? ''
  }

  async isFullnameErrorVisible(): Promise<boolean> {
    return this.fullnameError.isVisible()
  }

  async isPostalcodeErrorVisible(): Promise<boolean> {
    return this.postalcodeError.isVisible()
  }

  async getFullnameError(): Promise<string> {
    return (await this.fullnameError.textContent()) ?? ''
  }

  async getPostalcodeError(): Promise<string> {
    return (await this.postalcodeError.textContent()) ?? ''
  }
}
