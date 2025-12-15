export type TAdditionalLocales = 'fa' | 'fr' | 'ru' | 'zh'
export type TEnabledLocales = 'en' | TAdditionalLocales
export type TPlatform = 'android' | 'androidTV' | 'appleTV' | 'ios' | 'linux' | 'macos' | 'windows'

export interface ILocalizedText {
    en: string
    fa?: string
    ru?: string
    zh?: string
    fr?: string
}

export interface IStep {
    description: ILocalizedText
}

export interface IButton {
    buttonLink: string
    buttonText: ILocalizedText
}
export interface ITitleStep extends IStep {
    buttons: IButton[]
    title: ILocalizedText
}

export interface IAppConfig {
    additionalAfterAddSubscriptionStep?: ITitleStep
    additionalBeforeAddSubscriptionStep?: ITitleStep
    addSubscriptionStep: IStep
    connectAndUseStep: IStep
    /**
     * URL to the app icon (usually a path under /assets/..., e.g. /assets/apps-icons/happ.svg).
     * Used in UI to visually associate the instruction steps with the selected app.
     */
    iconUrl?: string
    id: string
    installationStep: {
        buttons: IButton[]
        description: ILocalizedText
    }
    isFeatured: boolean
    isNeedBase64Encoding?: boolean
    name: string
    urlScheme: string
}

export interface ISubscriptionPageConfiguration {
    additionalLocales: TAdditionalLocales[]
    branding?: {
        logoUrl?: string
        name?: string
        supportUrl?: string
    }
}

export interface ISubscriptionPageAppConfig {
    config: ISubscriptionPageConfiguration
    platforms: Record<TPlatform, IAppConfig[]>
}
