interface Envs {
    [key:string]: {
        stage: {
            url: string;
            api: string;
        },
        prod?: {
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
    // TODO(JTD-325): api host follows the naming convention every other
    // storefront uses, but is unverified - no client-side call to a
    // separate API host was observed live (same situation as Russells),
    // and no auth.setup.ts is planned yet (login looks UI-only, matching
    // the "Sign In | Register" header link). Revisit if that changes.
    jtdove: {
        stage:
            {
                url: "https://staging.jtdove.pub",
                api: "https://staging-api.jtdove.pub"
            }
    },
}

