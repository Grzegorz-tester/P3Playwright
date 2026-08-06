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
        // IE is a separate Watco storefront market (same platform, own
        // domain) — not a general convention yet, just what WAT-305 needs.
        stageIe?: {
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
            }
    },
}

