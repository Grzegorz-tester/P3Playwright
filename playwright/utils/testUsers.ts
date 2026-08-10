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

export const russells = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+russells_automation@velstar.co.uk",
        password: "Testing123!"
    },
    // VERIFIED live (staging, 2026-08-02): Wishlists (/account/wishlists)
    // is gated to admin accounts only — accountTestUser_1 above gets a
    // genuine 404 there, confirmed even while actively logged in.
    accountAdminUser: {
        email: "grzegorz.hajduk+russells_automation_admin@velstar.co.uk",
        password: "Testing123!"
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

// NL market (same Watco platform, own domain/data — see testEnvs.ts
// watco.stageNl). Registered live (staging, 2026-08-06); same staging
// test-data-reset caveat as watco.accountTestUserWithVat above applies.
export const watcoNl = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watconl@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (NL000099998B57).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watconl_hasvat_1786009863906@velstar.co.uk",
        password: "Testing123!"
    }
}

// BE-NL market — Belgium, Dutch language (same Watco platform, own
// domain/data — see testEnvs.ts watco.stageBeNl). Registered live
// (staging, 2026-08-06); same staging test-data-reset caveat as
// watco.accountTestUserWithVat above applies.
export const watcoBeNl = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcobenl@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (BE0123456749).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcobenl_hasvat_1786013489742@velstar.co.uk",
        password: "Testing123!"
    }
}

// BE-FR market — Belgium, French language (same Watco platform, own
// domain/data — see testEnvs.ts watco.stageBeFr). Registered live
// (staging, 2026-08-06); same staging test-data-reset caveat as
// watco.accountTestUserWithVat above applies.
export const watcoBeFr = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcobefr@velstar.co.uk",
        password: "Testing123!"
    },
    // Dedicated account with a saved VAT number (BE0411905847).
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcobefr_hasvat_1786016690754@velstar.co.uk",
        password: "Testing123!"
    }
}

// PL market — Poland (same Watco platform, own domain/data — see
// testEnvs.ts watco.stagePl). Registered live (staging, 2026-08-06); same
// staging test-data-reset caveat as watco.accountTestUserWithVat above
// applies. accountTestUserWithVat has a saved NIP-EU (PL9876543210) —
// PL's OWN NIP field (the domestic tax ID) is left blank on this account,
// matching the QA doc's own scenario coverage (it only tests a saved
// NIP-EU, never a saved NIP).
export const watcoPl = {
    accountTestUser_1: {
        email: "grzegorz.hajduk+watcopl@velstar.co.uk",
        password: "Testing123!"
    },
    accountTestUserWithVat: {
        email: "grzegorz.hajduk+watcopl_hasvat_1786020219987@velstar.co.uk",
        password: "Testing123!"
    }
}

