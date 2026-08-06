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
 * Generates a unique, throwaway guest-checkout email under a real Velstar
 * alias (grzegorz.hajduk+<label>_<timestamp>@velstar.co.uk), rather than a
 * fully synthetic faker email. Matches the naming shape already used for
 * this project's manually-created test accounts, so a stray guest order
 * created by a test run stays greppable in a real inbox/admin panel during
 * debugging. `label` should identify the calling test (e.g. "watco-poa").
 */
export function generateGuestEmail(label: string): string {
    return `grzegorz.hajduk+${label}_${Date.now()}@velstar.co.uk`
}
