import { fakerEN_GB as faker } from '@faker-js/faker'

export type AddressData = {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    postcode: string
}

/**
 * Generates a random, UK-format delivery address. The EN_GB locale is used so the
 * postcode passes the storefronts' UK postcode validation.
 */
export function generateDeliveryAddress(): AddressData {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        postcode: faker.location.zipCode(),
    }
}

/**
 * A unique guest checkout email per test run. CONFIRMED live (JTDove
 * staging, 2026-08-11): re-using the same fixed guest email across many
 * repeated checkout attempts eventually left a real checkout step stuck
 * disabled with no visible error - some backend anti-abuse/duplicate
 * check tied to the email itself, not a locator problem. `label` keeps
 * the address human-identifiable (e.g. in order confirmations) while
 * staying unique per run.
 */
export function generateGuestEmail(label: string): string {
    return `${label}+${faker.string.alphanumeric(10)}@example.com`
}
