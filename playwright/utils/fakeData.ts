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
