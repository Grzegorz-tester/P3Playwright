// VERIFIED live (staging, 2026-08-10). `name` is the exact visible
// product title, used to target basket lines by product (see
// JTDoveObjects.BasketPage.lineByProductName - basket lines can't be
// targeted by position, see that locator's own comment for why).
export const products = {
    // Delivered by JT Dove's own fleet - offers a Collect at Branch /
    // Deliver toggle on the basket line.
    HANSON_CEMENT_25KG: {
        link: '/products/25kg-hanson-cement',
        name: 'Heidelberg Materials General Purpose Cement In Paper Bag Hanson (25kg)'
    },
    // Delivered by 3rd-party courier only - basket line shows the same
    // Collect at Branch/Deliver toggle as any other line, but BOTH
    // buttons are permanently disabled (locked to Deliver - CONFIRMED
    // live, 2026-08-11) plus a "Delivered by Courier" note not shown on
    // other lines. NOTE: the product named in JTD-325's test case
    // ("Scruffs Black Trade Reflective Beanie Hat T55337") is indexed in
    // Algolia search but its own PDP 404s on staging (CONFIRMED live,
    // 2026-08-10) - this is a substitute product with the same
    // courier-only fulfilment, per explicit user direction.
    SCRUFFS_BOBBLE_HAT: {
        link: '/products/scruffs-trade-bobble-hat',
        name: 'Scruffs Trade Bobble Hat'
    },
    // Collection-only, sold per length (3.6m / 4.8m quantity pickers) via
    // a separate "Click & Collect" add-to-basket button - triggers the
    // branch stock-availability popup on add.
    C16_CARCASSING: {
        link: '/products/47x100-eedge-kilndried-graded-c16-carc-naturewood-treated',
        name: 'C16 Eased Edge Kiln Dried Green Treated Carcassing (47 x 100mm)'
    }
}
