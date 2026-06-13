import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly loginPage: Locator

  constructor(page: Page) {
    this.page = page
    this.loginPage = page.getByTestId('login-page')
  }

  userButton(userId: string): Locator {
    return this.page.getByTestId(`login-user-${userId}`)
  }

  async loginAsUser(userId: string): Promise<void> {
    await this.page.goto('login')
    await this.userButton(userId).click()
    await this.page.waitForURL('**/products')
  }

  async isAt(): Promise<boolean> {
    return this.page.url().includes('/login')
  }
}
