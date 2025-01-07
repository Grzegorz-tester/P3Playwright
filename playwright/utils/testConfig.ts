import {envs} from "./testEnvs";

let storefrontUrl: string
let storefrontApi: string

function getUrl (projectName: string) {
    storefrontUrl = envs[projectName[process.env.ENV].url]
    return storefrontUrl
}

function getApi (projectName: string) {
    storefrontApi = envs[projectName[process.env.ENV].api]
    return storefrontApi
}

export const testConfig = {
    storefrontUrl: getUrl,
    storefrontApi: getApi,
    waitForElement: 30000
}


