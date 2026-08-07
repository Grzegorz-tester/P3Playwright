interface Envs {
  [key: string]: {
    stage: {
      url: string,
      api: string,
    },
    prod?: {
      url: string,
      api: string,
    },
  },
}

export const envs: Envs = {
  carbon: {
    stage: {
      url: "https://staging.peracto3carbon.pub",
      api: "https://staging-api.peracto3carbon.pub",
    },
  },
  mipa: {
    stage: {
      url: "https://staging.mipa-paints.pub",
      api: "https://staging-api.mipa-paints.pub",
    },
  },
  keylite: {
    stage: {
      url: "https://staging.keyliteroofwindows.pub",
      api: "https://staging-api.keyliteroofwindows.pub",
    },
  },
  kooltech: {
    stage: {
      url: "https://staging.kooltech.pub/",
      api: "https://staging-api.kooltech.pub",
    },
    prod: {
      url: "https://www.kooltech.co.uk/", // not accounted for
      api: "https://api.kooltech.co.uk", // not accounted for
    },
  },
  indespension: {
    stage: {
      url: "https://staging.indespension.pub",
      api: "https://staging-api.indespension.pub",
    },
  },
  insinkerator_eu: {
    stage: {
      url: "https://staging.insinkerator-eu.work",
      api: "https://staging-api.insinkerator-eu.work",
    },
  },
};
