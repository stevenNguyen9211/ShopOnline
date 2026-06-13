import { Page, Locator } from '@playwright/test'

export class CartPage {
  readonly page: Page
  readonly cartEmptyMessage: Locator
  readonly cartTotal: Locator
  readonly cartCheckoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.cartEmptyMessage = page.getByTestId('cart-empty-message')
    this.cartTotal = page.getByTestId('cart-total')
    this.cartCheckoutButton = page.getByTestId('cart-checkout')
  }

  cartItem(productId: string): Locator {
    return this.page.getByTestId(`cart-item-${productId}`)
  }

  itemQuantity(productId: string): Locator {
    return this.cartItem(productId).getByTestId('cart-item-quantity')
  }

  itemIncrease(productId: string): Locator {
    return this.cartItem(productId).getByTestId('cart-item-increase')
  }

  itemDecrease(productId: string): Locator {
    return this.cartItem(productId).getByTestId('cart-item-decrease')
  }

  itemRemove(productId: string): Locator {
    return this.cartItem(productId).getByTestId('cart-item-remove')
  }

  itemSubtotal(productId: string): Locator {
    return this.cartItem(productId).getByTestId('cart-item-subtotal')
  }

  async getTotal(): Promise<string> {
    return (await this.cartTotal.textContent()) ?? ''
  }

  async getQuantity(productId: string): Promise<number> {
    const text = await this.itemQuantity(productId).textContent()
    return parseInt(text ?? '0', 10)
  }

  async increaseQuantity(productId: string): Promise<void> {
    await this.itemIncrease(productId).click()
  }

  async decreaseQuantity(productId: string): Promise<void> {
    await this.itemDecrease(productId).click()
  }

  async removeItem(productId: string): Promise<void> {
    await this.itemRemove(productId).click()
  }

  async goToCheckout(): Promise<void> {
    await this.cartCheckoutButton.click()
    await this.page.waitForURL('**/checkout')
  }

  async isCheckoutDisabled(): Promise<boolean> {
    return this.cartCheckoutButton.isDisabled()
  }

  async isEmpty(): Promise<boolean> {
    return this.cartEmptyMessage.isVisible()
  }

  async isIncreaseDisabled(productId: string): Promise<boolean> {
    return this.itemIncrease(productId).isDisabled()
  }

  async isDecreaseDisabled(productId: string): Promise<boolean> {
    return this.itemDecrease(productId).isDisabled()
  }

  async getCartCount(): Promise<string> {
    return (await this.page.getByTestId('header-cart-count').textContent()) ?? '0'
  }
}
