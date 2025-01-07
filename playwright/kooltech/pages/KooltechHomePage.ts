import type { Page } from '@playwright/test'
import { HomePage } from '../../carbon/pages/HomePage'

export class KooltechHomePage extends HomePage{
    readonly page: Page

}