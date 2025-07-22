interface Product {
    link: string,
    title: string,
    price?: string,
    category: string,
}


export const products = {
    SIMPLE_PURCHASABLE_PRODUCT_9: {
        link: '/products/simple-purchasable-product-spp-9',
        title: 'Simple Purchasable Product 9',
        price: '28.25',
        category: 'Simple Products'
    },
    SIMPLE_PURCHASABLE_PRODUCT_8: {
        link: '/products/simple-purchasable-product-spp-8',
        title: 'Simple Purchasable Product 8',
        price: '59.46',
        category: 'Simple Products'
    },
    SIMPLE_ENQUIRY_PRODUCT_6: {
        link: '/products/simple-enquiry-product-sep-6',
        title: 'Simple Enquiry Product 6',
        price: '39.05',
        category: 'Simple Products'
    },
    VARIANT_PURCHASABLE_PRODUCT_24: {
        link: '/products/variant-purchasable-no-default-product-vpndp-24',
        title: 'Variant Purchasable No Default Product 24',
        size: "Small",
        colour: "Blue",
        price: '758.00',
        category: 'Variant Products'
    }
}

export default products
export type {Product as Product}