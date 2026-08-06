export const carbon = {
    testUser_1: {
        email: "alona.starunova+autotest+1@velstar.co.uk",
        password: "Test123$"
    },
    testUser_2: {
        email: "alona.starunova+autotest+2@velstar.co.uk",
        password: "Test123$"
    },
}

export const mipa = {
    accountTestUser_1: {
        email: "automated_test_user+1+mipa@9xb.com",
        password: "Test123$"
    }
}

export const kooltech = {
    accountTestUser_1: {
        email: "automated_test_user+1+kooltech@9xb.com",
        password: "Test123$"
    }
}

export const watco = {
    accountTestUser_1: {
        email: "grzegorz.hajduk@velstar.co.uk",
        password: "Testing123!"
    },
    // VERIFIED live (staging, 2026-08-05): dedicated account with a saved
    // VAT number (GB123456789), registered specifically for WAT-335's
    // "has saved VAT" scenarios — accountTestUser_1 above has none.
    // NOTE: staging test data has been observed to reset between sessions —
    // an earlier account under this same alias stopped logging in and had
    // to be re-registered. If tests using this account start failing
    // login, re-register via /register with a customer_vat_number of
    // GB123456789 and update this entry.
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watco_hasvat_1785956451012@velstar.co.uk",
        password: "Testing123!"
    }
}

// IE market (same Watco platform, own domain/data — see testEnvs.ts
// watco.stageIe). Registered live (staging, 2026-08-06); same staging
// test-data-reset caveat as watco.accountTestUserWithVat above applies.
export const watcoIe = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcoie@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (IE1234567L).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcoie_hasvat_1785999614167@velstar.co.uk",
        password: "Testing123!"
    }
}

// FR market (same Watco platform, own domain/data — see testEnvs.ts
// watco.stageFr). Registered live (staging, 2026-08-06); same staging
// test-data-reset caveat as watco.accountTestUserWithVat above applies.
export const watcoFr = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcofr@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (FRAB123456789).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcofr_hasvat_1786002045757@velstar.co.uk",
        password: "Testing123!"
    }
}

// DE market (same Watco platform, own domain/data — see testEnvs.ts
// watco.stageDe). Registered live (staging, 2026-08-06); same staging
// test-data-reset caveat as watco.accountTestUserWithVat above applies.
export const watcoDe = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcode@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (DE123456789).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcode_hasvat_1786004937149@velstar.co.uk",
        password: "Testing123!"
    }
}



