import { FaDiscord, FaTelegramPlane, FaVk } from 'react-icons/fa'
import { PiCopy, PiLinkSimpleBold, PiQuestionBold } from 'react-icons/pi'
import { ActionIcon, Button, Group, Image, Stack, Text, useMantineColorScheme } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { useClipboard } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { renderSVG } from 'uqr'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscriptionInfoStoreInfo } from '@entities/subscription-info-store'

export const SubscriptionLinkWidget = ({ supportUrl }: { supportUrl?: string }) => {
    const { t } = useTranslation()
    const { subscription } = useSubscriptionInfoStoreInfo()
    const clipboard = useClipboard({ timeout: 10000 })
    const { colorScheme } = useMantineColorScheme()

    if (!subscription) return null

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const handleCopy = () => {
        notifications.show({
            title: t('subscription-link.widget.link-copied'),
            message: t('subscription-link.widget.link-copied-to-clipboard'),
            color: 'green'
        })
        clipboard.copy(subscriptionUrl)
    }

    const renderSupportLink = (supportUrl: string) => {
        const iconConfig = {
            't.me': { icon: FaTelegramPlane, color: '#22c55e' },
            'discord.com': { icon: FaDiscord, color: '#f59e0b' },
            'vk.com': { icon: FaVk, color: '#84cc16' }
        }

        const matchedPlatform = Object.entries(iconConfig).find(([domain]) =>
            supportUrl.includes(domain)
        )

        const { icon: Icon, color } = matchedPlatform
            ? matchedPlatform[1]
            : { icon: PiQuestionBold, color: '#94a3b8' }

        return (
            <ActionIcon
                c={color}
                component="a"
                href={supportUrl}
                rel="noopener noreferrer"
                size="xl"
                radius="md"
                target="_blank"
                variant="default"
                style={{
                    background: 'var(--sp-surface)',
                    border: '1px solid var(--sp-border)',
                    transition: 'all 0.2s ease'
                }}
            >
                <Icon />
            </ActionIcon>
        )
    }

    const handleGetLink = () => {
        const isDark = colorScheme === 'dark'
        const subscriptionQrCode = renderSVG(subscriptionUrl, {
            whiteColor: isDark ? '#0b1220' : '#ffffff',
            blackColor: isDark ? '#22c55e' : '#166534'
        })

        modals.open({
            centered: true,
            title: t('subscription-link.widget.get-link'),
            styles: {
                content: {
                    background: 'var(--sp-surface-strong)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--sp-border)'
                },
                header: {
                    background: 'transparent'
                },
                title: {
                    fontWeight: 600,
                    color: 'var(--sp-text)'
                }
            },
            children: (
                <Stack align="center">
                    <Image
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(subscriptionQrCode)}`}
                        style={{ borderRadius: 'var(--mantine-radius-md)' }}
                    />
                    <Text fw={600} size="lg" ta="center" c="var(--sp-text)">
                        {t('subscription-link.widget.scan-qr-code')}
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                        {t('subscription-link.widget.line-1')}
                    </Text>

                    <Button
                        fullWidth
                        onClick={handleCopy}
                        variant="light"
                        radius="md"
                        leftSection={<PiCopy />}
                    >
                        {t('subscription-link.widget.copy-link')}
                    </Button>
                </Stack>
            )
        })
    }
    return (
        <Group gap="xs">
            <ActionIcon
                onClick={handleGetLink}
                size="xl"
                radius="md"
                variant="default"
                style={{
                    background: 'var(--sp-surface)',
                    border: '1px solid var(--sp-border)',
                    transition: 'all 0.2s ease'
                }}
            >
                <PiLinkSimpleBold />
            </ActionIcon>

            {supportUrl && renderSupportLink(supportUrl)}
        </Group>
    )
}
