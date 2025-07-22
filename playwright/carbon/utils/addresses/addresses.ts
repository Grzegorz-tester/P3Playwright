interface Address {
    firstName: string,
    lastName: string,
    addressLine_1: string,
    city: string,
    postcode: string,
    saveAsDefault?: boolean
}

export const addresses = {
    address_1: {
        firstName: 'Test',
        lastName: 'Auto 1',
        addressLine_1: `53 Farm St ${Math.floor(Math.random()*90000) + 10000}`,
        city: 'TestCity',
        postcode: 'M160UG',
        saveAsDefault: false
    },
    address_2: {
        firstName: 'Test',
        lastName: 'Auto 2',
        addressLine_1: `53 Farm St ${Math.floor(Math.random()*90000) + 10000}`,
        city: 'TestCity',
        postcode: 'M160UG',
        saveAsDefault: true
    }
}

export default addresses
export type {Address as Address}