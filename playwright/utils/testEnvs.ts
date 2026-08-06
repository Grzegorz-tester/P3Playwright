interface Envs {
    [key:string]: {
        stage: {
            url: string;
            api: string;
        },
        prod?: {
            url: string;
            api: string;
        },
        // IE/FR are separate Watco storefront markets (same platform, own
        // domain) — not a general convention yet, just what WAT-305 needs.
        stageIe?: {
            url: string;
            api: string;
        },
        stageFr?: {
            url: string;
            api: string;
        },
        stageDe?: {
            url: string;
            api: string;
        },
        stageNl?: {
            url: string;
            api: string;
        },
        stageBeNl?: {
            url: string;
            api: string;
        },
        stageBeFr?: {
            url: string;
            api: string;
        }
    }
}

export const envs: Envs = {
    carbon: {
        stage:
            {
                url: "https://staging.peracto3carbon.pub",
                api: "https://staging-api.peracto3carbon.pub"
            }

    },
    mipa: {
        stage:
            {
                url: "https://staging.mipa-paints.pub",
                api: "https://staging-api.mipa-paints.pub"
            }
    },
    keylite: {
        stage:
            {
                url: "https://staging.keyliteroofwindows.pub",
                api: "https://staging-api.keyliteroofwindows.pub"
            }
    },
    kooltech: {
        stage: {
            url: "https://staging.kooltech.pub/",
            api: "https://staging-api.kooltech.pub"
        },
        prod: {
            url: "https://www.kooltech.co.uk/", // not accounted for
            api: "https://api.kooltech.co.uk"// not accounted for
        }
    },
    indespension: {
        stage:
            {
                url: "https://staging.indespension.pub",
                api: "https://staging-api.indespension.pub"
            }
    },
    // TODO(WAT-305): no separate API host confirmed yet — no auth.setup.ts
    // is planned for this project (UI login only, matching the confirmed
    // pattern of the closest sibling project), so this is likely unused.
    // Revisit if that changes.
    watco: {
        stage:
            {
                url: "https://staging-uk.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): same platform as the UK
        // site, own domain and market data (VAT format, rate, currency).
        stageIe:
            {
                url: "https://staging-ie.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): same platform, but this
        // market localizes its own URL PATHS too (not just VAT format/
        // rate/currency) — /se-connecter, /senregistrer, /panier,
        // /valider-la-commande, /mon-compte instead of the UK/IE English
        // routes. See WatcoLoginPage/WatcoRegisterPage/WatcoBasketPage/
        // WatcoCheckoutPage for the path-override params this requires.
        stageFr:
            {
                url: "https://staging-fr.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): localized paths like FR
        // (/anmelden, /registrieren, /warenkorb, /kasse, /kundenkonto),
        // PLUS genuinely different VAT behaviour from every other market
        // checked so far — Pay on Account is hidden until a valid VAT
        // number is applied, the field has a real explanatory comment,
        // and VAT rate is delivery-country-aware (a DE VAT number
        // zero-rates delivery to Austria). See the *-de.test.ts files'
        // docblocks for what's actually verified.
        stageDe:
            {
                url: "https://staging-de.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): localized paths like DE/FR
        // (/inloggen, /registreren, /winkelmandje, /de-bestelling-
        // valideren, /mijn-account). Also VAT-gated Pay on Account and a
        // business-customer comment like DE, but its zero-rating rule is
        // SIMPLER — a valid NL VAT number zero-rates the order even for a
        // domestic NL→NL delivery (DE only zero-rates for a delivery
        // country different from its own). See the *-nl.test.ts files'
        // docblocks for what's actually verified.
        stageNl:
            {
                url: "https://staging-nl.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): Belgium, Dutch-language
        // storefront — same URL paths and VAT behaviour as NL (domestic
        // zero-rating, VAT-gated Pay on Account, identical comment text),
        // but its own VAT field label ("Btw-nummer" vs NL's "Belasting
        // over de toegevoegde waarde") and format (BE1234567890).
        stageBeNl:
            {
                url: "https://staging-benl.watco.pub",
                api: ""
            },
        // VERIFIED live (staging, 2026-08-06): Belgium, French-language
        // storefront — same URL paths as FR (/valider-la-commande, etc.)
        // and same VAT field behaviour (single field, not the "NIP/NIP-EU"
        // pair the QA doc's scenario 1 mentions — see the *-befr.test.ts
        // docblocks for the full live verification, including why that
        // scenario is treated as a doc artifact rather than a real
        // divergence).
        stageBeFr:
            {
                url: "https://staging-befr.watco.pub",
                api: ""
            }
    },
}

