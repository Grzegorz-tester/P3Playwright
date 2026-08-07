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

export type WarrantyRegistrationData = {
    firstName: string
    lastName: string
    email: string
    placeOfPurchase: string
    serialNumber: string
}

/**
 * Generates throwaway product-registration data for the Insinkerator
 * warranty-finder flow. lastName and serialNumber are stamped with
 * Date.now() so each run registers a fresh, unique record — the warranty
 * finder looks records up by that exact pair, so reusing a prior run's
 * values would risk colliding with (or silently reusing) an old one.
 */
export function generateWarrantyRegistration(label: string): WarrantyRegistrationData {
    const uniqueSuffix = `${label}${Date.now()}`
    return {
        firstName: faker.person.firstName(),
        lastName: `Warranty${uniqueSuffix}`,
        email: `grzegorz.hajduk+${uniqueSuffix}@velstar.co.uk`,
        placeOfPurchase: faker.company.name(),
        serialNumber: `SN${uniqueSuffix}`,
    }
}
