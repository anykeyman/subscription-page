import { Avatar, Box, Container, Group, Select, Stack, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { useOs } from '@mantine/hooks'
import {
    IconBrandAndroid,
    IconBrandApple,
    IconBrandWindows,
    IconDeviceDesktop
} from '@tabler/icons-react'

import {
    ISubscriptionPageAppConfig,
    TPlatform,
    TEnabledLocales
} from '@shared/constants/apps-config/interfaces/app-list.interface'
import { LanguagePicker } from '@shared/ui/language-picker/language-picker.shared'
import { Page } from '@shared/ui'

import { InstallationGuideWidget } from '../../../../widgets/main/installation-guide/installation-guide.widget'
import { SubscriptionLinkWidget } from '../../../../widgets/main/subscription-link/subscription-link.widget'
import { SubscriptionInfoWidget } from '../../../../widgets/main/subscription-info/subscription-info.widget'

export const MainPageComponent = ({
    subscriptionPageAppConfig,
    isMobile
}: {
    subscriptionPageAppConfig: ISubscriptionPageAppConfig
    isMobile: boolean
}) => {
    const os = useOs()
    const [selectedPlatform, setSelectedPlatform] = useState<TPlatform>('windows')
    const [selectedAppId, setSelectedAppId] = useState<string>('')

    let additionalLocales: TEnabledLocales[] = ['en', 'ru', 'fa', 'zh', 'fr']

    if (subscriptionPageAppConfig.config.additionalLocales !== undefined) {
        additionalLocales = [
            'en',
            ...subscriptionPageAppConfig.config.additionalLocales.filter((locale) =>
                ['fa', 'fr', 'ru', 'zh'].includes(locale)
            )
        ]
    }

    const brandName = subscriptionPageAppConfig.config.branding?.name || 'Remnawave'

    const platforms = subscriptionPageAppConfig.platforms

    const availablePlatforms = useMemo(() => {
        const has = (p: TPlatform) => Array.isArray(platforms[p]) && platforms[p].length > 0
        return [
            has('android') && { value: 'android', label: 'Android', icon: <IconBrandAndroid size={18} /> },
            has('ios') && { value: 'ios', label: 'iOS', icon: <IconBrandApple size={18} /> },
            has('macos') && { value: 'macos', label: 'macOS', icon: <IconBrandApple size={18} /> },
            has('windows') && { value: 'windows', label: 'Windows', icon: <IconBrandWindows size={18} /> },
            has('linux') && { value: 'linux', label: 'Linux', icon: <IconDeviceDesktop size={18} /> },
            has('androidTV') && {
                value: 'androidTV',
                label: 'Android TV',
                icon: <IconBrandAndroid size={18} />
            },
            has('appleTV') && { value: 'appleTV', label: 'Apple TV', icon: <IconBrandApple size={18} /> }
        ].filter(Boolean) as { value: TPlatform; label: string; icon: React.ReactNode }[]
    }, [platforms])

    // Choose a sensible default platform based on OS (once), falling back to first available.
    useEffect(() => {
        const osToPlatform: Partial<Record<string, TPlatform>> = {
            android: 'android',
            ios: 'ios',
            linux: 'linux',
            macos: 'macos',
            windows: 'windows'
        }
        const preferred = osToPlatform[os]
        const pick =
            (preferred && availablePlatforms.find((p) => p.value === preferred)?.value) ||
            availablePlatforms[0]?.value ||
            'windows'
        setSelectedPlatform(pick)
    }, [os, availablePlatforms])

    // Keep selectedAppId valid for the chosen platform
    useEffect(() => {
        const apps = platforms[selectedPlatform] || []
        if (apps.length === 0) return
        if (!selectedAppId || !apps.some((a) => a.id === selectedAppId)) {
            setSelectedAppId(apps[0].id)
        }
    }, [platforms, selectedPlatform, selectedAppId])

    const availableApps = useMemo(() => {
        const apps = platforms[selectedPlatform] || []
        return apps.map((app) => ({
            value: app.id,
            label: app.name,
            iconUrl: app.iconUrl
        }))
    }, [platforms, selectedPlatform])

    const headerControlHeight = 44 // match Mantine ActionIcon size="xl"
    const headerSelectStyles = {
        input: {
            height: headerControlHeight,
            minHeight: headerControlHeight,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
        },
        section: {
            height: headerControlHeight
        }
    } as const

    return (
        <Page>
            <Box className="header-wrapper" py="md">
                <Container maw={1200} px={{ base: 'md', sm: 'lg', md: 'xl' }}>
                    <Stack gap="xs">
                        {/* Row 1: service name, link icon, telegram link, language */}
                        <Group justify="space-between" wrap="wrap" gap="xs">
                            <Title order={4} fw={800} style={{ userSelect: 'none' }}>
                                <Text component="span" inherit c="white">
                                    {brandName}
                                </Text>
                            </Title>

                            <Group gap="xs" wrap="nowrap">
                                <SubscriptionLinkWidget
                                    supportUrl={subscriptionPageAppConfig.config.branding?.supportUrl}
                                />
                                <LanguagePicker enabledLocales={additionalLocales} />
                            </Group>
                        </Group>

                        {/* Row 2: platform + app selectors */}
                        <Group justify="flex-start" wrap="wrap" gap="xs">
                            {availablePlatforms.length > 1 && (
                                <Select
                                    allowDeselect={false}
                                    data={availablePlatforms.map((p) => ({
                                        value: p.value,
                                        label: p.label
                                    }))}
                                    leftSection={
                                        availablePlatforms.find((p) => p.value === selectedPlatform)?.icon
                                    }
                                    onChange={(value) => setSelectedPlatform((value || 'windows') as TPlatform)}
                                    radius="md"
                                    size="md"
                                    style={{ width: isMobile ? '100%' : 170 }}
                                    value={selectedPlatform}
                                    withScrollArea={false}
                                    styles={headerSelectStyles}
                                />
                            )}

                            {availableApps.length > 1 && (
                                <Select
                                    allowDeselect={false}
                                    data={availableApps.map((a) => ({
                                        value: a.value,
                                        label: a.label
                                    }))}
                                    leftSection={
                                        <Avatar
                                            src={availableApps.find((a) => a.value === selectedAppId)?.iconUrl}
                                            size={18}
                                            radius={5}
                                            styles={{
                                                root: {
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    border: '1px solid rgba(255, 255, 255, 0.12)'
                                                },
                                                image: { objectFit: 'contain' }
                                            }}
                                        >
                                            {(availableApps.find((a) => a.value === selectedAppId)?.label || '?')
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </Avatar>
                                    }
                                    onChange={(value) => setSelectedAppId(value || '')}
                                    radius="md"
                                    size="md"
                                    style={{ width: isMobile ? '100%' : 240 }}
                                    value={selectedAppId}
                                    withScrollArea={false}
                                    styles={headerSelectStyles}
                                />
                            )}
                        </Group>
                    </Stack>
                </Container>
            </Box>

            <Container
                maw={1200}
                px={{ base: 'md', sm: 'lg', md: 'xl' }}
                py="xl"
                style={{ position: 'relative', zIndex: 1 }}
            >
                <Stack gap="xl">
                    {/* Language picker moved to header */}
                    <SubscriptionInfoWidget isMobile={isMobile} />
                    <InstallationGuideWidget
                        appsConfig={subscriptionPageAppConfig.platforms}
                        enabledLocales={additionalLocales}
                        isMobile={isMobile}
                        selectedPlatform={selectedPlatform}
                        selectedAppId={selectedAppId}
                    />
                </Stack>
            </Container>
        </Page>
    )
}
