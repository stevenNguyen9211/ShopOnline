import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly loginPage: Locator
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.loginPage = page.getByTestId('login-page')
    this.usernameInput = page.getByTestId('login-username')
    this.passwordInput = page.getByTestId('login-password')
    this.submitButton = page.getByTestId('login-submit')
    this.errorMessage = page.getByTestId('login-error')
  }

  async loginAsUser(userId: string, password = '123'): Promise<void> {
    await this.page.goto('login')
    await this.usernameInput.fill(userId)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    await this.page.waitForURL('**/products')
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username)
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? ''
  }

  async isAt(): Promise<boolean> {
    return this.page.url().includes('/login')
  }
}
