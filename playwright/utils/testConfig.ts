import {envs} from "./testEnvs";


function getUrl (projectName: string) {
    return envs[projectName][process.env.ENV].url
}

function getApi (projectName: string) {
    return envs[projectName][process.env.ENV].api

}

export const testConfig = {
    getUrl,
    getApi,
    waitForElement: 30000
}


