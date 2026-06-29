import { Page, Locator } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page

  readonly fullNameInput: Locator
  readonly emailInput: Locator
  readonly streetAddressInput: Locator
  readonly wardInput: Locator
  readonly districtInput: Locator
  readonly cityInput: Locator
  readonly phoneInput: Locator
  readonly postalCodeInput: Locator

  readonly fullNameError: Locator
  readonly emailError: Locator
  readonly streetAddressError: Locator
  readonly wardError: Locator
  readonly districtError: Locator
  readonly cityError: Locator
  readonly phoneError: Locator
  readonly postalCodeError: Locator

  readonly orderSummary: Locator
  readonly subtotalText: Locator
  readonly shippingFeeText: Locator
  readonly totalText: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page

    this.fullNameInput = page.getByTestId('checkout-full-name')
    this.emailInput = page.getByTestId('checkout-email')
    this.streetAddressInput = page.getByTestId('checkout-street-address')
    this.wardInput = page.getByTestId('checkout-ward')
    this.districtInput = page.getByTestId('checkout-district')
    this.cityInput = page.getByTestId('checkout-city')
    this.phoneInput = page.getByTestId('checkout-phone')
    this.postalCodeInput = page.getByTestId('checkout-postal-code')

    this.fullNameError = page.getByTestId('checkout-full-name-error')
    this.emailError = page.getByTestId('checkout-email-error')
    this.streetAddressError = page.getByTestId('checkout-street-address-error')
    this.wardError = page.getByTestId('checkout-ward-error')
    this.districtError = page.getByTestId('checkout-district-error')
    this.cityError = page.getByTestId('checkout-city-error')
    this.phoneError = page.getByTestId('checkout-phone-error')
    this.postalCodeError = page.getByTestId('checkout-postal-code-error')

    this.orderSummary = page.getByTestId('checkout-order-summary')
    this.subtotalText = page.getByTestId('checkout-subtotal')
    this.shippingFeeText = page.getByTestId('checkout-shipping-fee')
    this.totalText = page.getByTestId('checkout-total')
    this.submitButton = page.getByTestId('checkout-submit')
  }

  async fillFullName(name: string): Promise<void> {
    await this.fullNameInput.clear()
    await this.fullNameInput.fill(name)
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.clear()
    await this.emailInput.fill(email)
  }

  async fillStreetAddress(address: string): Promise<void> {
    await this.streetAddressInput.clear()
    await this.streetAddressInput.fill(address)
  }

  async fillWard(ward: string): Promise<void> {
    await this.wardInput.clear()
    await this.wardInput.fill(ward)
  }

  async fillDistrict(district: string): Promise<void> {
    await this.districtInput.clear()
    await this.districtInput.fill(district)
  }

  async fillCity(city: string): Promise<void> {
    await this.cityInput.clear()
    await this.cityInput.fill(city)
  }

  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.clear()
    await this.phoneInput.fill(phone)
  }

  async fillPostalCode(code: string): Promise<void> {
    await this.postalCodeInput.clear()
    await this.postalCodeInput.fill(code)
  }

  async fillAllValid(): Promise<void> {
    await this.fillFullName('Nguyễn Văn A')
    await this.fillEmail('test@example.com')
    await this.fillStreetAddress('123 Đường Láng')
    await this.fillWard('Láng Thượng')
    await this.fillDistrict('Đống Đa')
    await this.fillCity('Hà Nội')
    await this.fillPhone('0912345678')
    await this.fillPostalCode('10000')
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async getTotal(): Promise<string> {
    return (await this.totalText.textContent()) ?? ''
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotalText.textContent()) ?? ''
  }

  async getShippingFee(): Promise<string> {
    return (await this.shippingFeeText.textContent()) ?? ''
  }

  async isFullNameErrorVisible(): Promise<boolean> {
    return this.fullNameError.isVisible()
  }

  async isEmailErrorVisible(): Promise<boolean> {
    return this.emailError.isVisible()
  }

  async isStreetAddressErrorVisible(): Promise<boolean> {
    return this.streetAddressError.isVisible()
  }

  async isWardErrorVisible(): Promise<boolean> {
    return this.wardError.isVisible()
  }

  async isDistrictErrorVisible(): Promise<boolean> {
    return this.districtError.isVisible()
  }

  async isCityErrorVisible(): Promise<boolean> {
    return this.cityError.isVisible()
  }

  async isPhoneErrorVisible(): Promise<boolean> {
    return this.phoneError.isVisible()
  }

  async isPostalCodeErrorVisible(): Promise<boolean> {
    return this.postalCodeError.isVisible()
  }
}
