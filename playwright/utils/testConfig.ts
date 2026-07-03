import {envs} from "./testEnvs";


function getUrl (projectName: string) {
    return envs[projectName][process.env.ENV].url
}

function getApi (projectName: string) {
    return envs[projectName][process.env.ENV].api

}

function getAuthFile (fileName: string = 'accountTestUser_1.json') {
    return (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '')
        + `projects/${process.env.PROJECT}/tests/.auth/${fileName}`
}

export const testConfig = {
    getUrl,
    getApi,
    getAuthFile,
    waitForElement: 30000
}
