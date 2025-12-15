import {
    IconBrandAndroid,
    IconBrandApple,
    IconBrandWindows,
    IconDeviceDesktop,
    IconExternalLink
} from '@tabler/icons-react'
import { Button, Card, Group, Stack } from '@mantine/core'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOs } from '@mantine/hooks'

import {
    IAppConfig,
    ISubscriptionPageAppConfig,
    TEnabledLocales,
    TPlatform
} from '@shared/constants/apps-config/interfaces/app-list.interface'
import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'

import { BaseInstallationGuideWidget } from './installation-guide.base.widget'

export const InstallationGuideWidget = ({
    appsConfig,
    enabledLocales,
    isMobile,
    selectedPlatform,
    selectedAppId
}: {
    appsConfig: ISubscriptionPageAppConfig['platforms']
    enabledLocales: TEnabledLocales[]
    isMobile: boolean
    selectedPlatform: TPlatform
    selectedAppId: string
}) => {
    const { i18n } = useTranslation()
    const { subscription } = useSubscriptionInfoStoreInfo()

    const os = useOs()

    const [currentLang, setCurrentLang] = useState<TEnabledLocales>('en')
    const [defaultTab, setDefaultTab] = useState('windows')

    useEffect(() => {
        const lang = i18n.language

        if (lang.startsWith('en')) {
            setCurrentLang('en')
        } else if (lang.startsWith('fa') && enabledLocales.includes('fa')) {
            setCurrentLang('fa')
        } else if (lang.startsWith('ru') && enabledLocales.includes('ru')) {
            setCurrentLang('ru')
        } else if (lang.startsWith('zh') && enabledLocales.includes('zh')) {
            setCurrentLang('zh')
        } else {
            setCurrentLang('en')
        }
    }, [i18n.language])

    useLayoutEffect(() => {
        switch (os) {
            case 'android':
                setDefaultTab('android')
                break
            case 'ios':
                setDefaultTab('ios')
                break
            case 'linux':
                setDefaultTab('linux')
                break
            case 'macos':
                setDefaultTab('macos')
                break
            case 'windows':
                setDefaultTab('windows')
                break
            default:
                setDefaultTab('windows')
                break
        }
    }, [os])

    if (!subscription) return null

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const hasPlatformApps = {
        ios: appsConfig.ios && appsConfig.ios.length > 0,
        android: appsConfig.android && appsConfig.android.length > 0,
        linux: appsConfig.linux && appsConfig.linux.length > 0,
        macos: appsConfig.macos && appsConfig.macos.length > 0,
        windows: appsConfig.windows && appsConfig.windows.length > 0,
        androidTV: appsConfig.androidTV && appsConfig.androidTV.length > 0,
        appleTV: appsConfig.appleTV && appsConfig.appleTV.length > 0
    }

    if (
        !hasPlatformApps.ios &&
        !hasPlatformApps.android &&
        !hasPlatformApps.linux &&
        !hasPlatformApps.macos &&
        !hasPlatformApps.windows &&
        !hasPlatformApps.androidTV &&
        !hasPlatformApps.appleTV
    ) {
        return null
    }

    const openDeepLink = (urlScheme: string, isNeedBase64Encoding: boolean | undefined) => {
        if (isNeedBase64Encoding) {
            const encoded = btoa(`${subscriptionUrl}`)
            const encodedUrl = `${urlScheme}${encoded}`
            window.open(encodedUrl, '_blank')
        } else {
            window.open(`${urlScheme}${subscriptionUrl}`, '_blank')
        }
    }

    const platform = selectedPlatform || (defaultTab as TPlatform)
    const platformApps = appsConfig[platform] || []
    const selectedApp =
        platformApps.find((a) => a.id === selectedAppId) || (platformApps[0] ?? null)

    const renderFirstStepButton = (app: IAppConfig) => {
        if (app.installationStep.buttons.length > 0) {
            return (
                <Group gap="xs" wrap="wrap">
                    {app.installationStep.buttons.map((button, index) => {
                        const buttonText = button.buttonText[currentLang] || button.buttonText.en

                        return (
                            <Button
                                component="a"
                                href={button.buttonLink}
                                key={index}
                                leftSection={<IconExternalLink size={14} />}
                                target="_blank"
                                variant="light"
                                radius="md"
                                size="sm"
                            >
                                {buttonText}
                            </Button>
                        )
                    })}
                </Group>
            )
        }

        return null
    }

    return (
        <Card p={{ base: 'sm', xs: 'md', sm: 'lg', md: 'xl' }} radius="lg" className="glass-card">
            <Stack gap="md">
                {selectedApp && (
                    <BaseInstallationGuideWidget
                        appsConfig={appsConfig}
                        isMobile={isMobile}
                        currentLang={currentLang}
                        openDeepLink={openDeepLink}
                        platform={platform}
                        selectedApp={selectedApp}
                        renderFirstStepButton={renderFirstStepButton}
                    />
                )}
            </Stack>
        </Card>
    )
}
