import {
    IconExternalLink,
    IconInfoCircle,
    IconStar
} from '@tabler/icons-react'
import { Avatar, Box, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import {
    IAppConfig,
    ILocalizedText,
    TEnabledLocales,
    TPlatform
} from '@shared/constants/apps-config/interfaces/app-list.interface'

import { IPlatformGuideProps } from './interfaces/platform-guide.props.interface'

export interface IBaseGuideProps extends IPlatformGuideProps {
    isMobile: boolean
    selectedApp: IAppConfig
    platform: TPlatform
    renderFirstStepButton: (app: IAppConfig) => React.ReactNode
    currentLang: TEnabledLocales
}

interface StepCardProps {
    isMobile: boolean
    title: React.ReactNode
    description: string
    children?: React.ReactNode
}

const StepCard = ({
    isMobile,
    title,
    description,
    children,
}: StepCardProps) => {
    return (
        <Card p={{ base: 'sm', xs: 'md', sm: 'lg' }} radius="lg" className="step-card">
            <Stack gap={isMobile ? 'xs' : 'sm'} style={{ minWidth: 0 }}>
                <Title order={6} c="var(--sp-text)" fw={600} style={{ wordBreak: 'break-word' }}>
                    {title}
                </Title>
                {description && (
                    <Text
                        size={isMobile ? 'xs' : 'sm'}
                        c="var(--sp-text-muted)"
                        style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
                    >
                        {description}
                    </Text>
                )}
                {children}
            </Stack>
        </Card>
    )
}

export const BaseInstallationGuideWidget = (props: IBaseGuideProps) => {
    const { t } = useTranslation()
    const {
        isMobile,
        openDeepLink,
        platform,
        selectedApp,
        renderFirstStepButton,
        currentLang
    } = props

    const appName = selectedApp?.name || ''

    const appTitleBadge =
        selectedApp && appName ? (
            <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                <Avatar
                    src={selectedApp.iconUrl}
                    size={18}
                    radius={5}
                    styles={{
                        root: {
                            background: 'color-mix(in srgb, var(--sp-surface) 70%, transparent)',
                            border: '1px solid var(--sp-border)',
                            flexShrink: 0
                        },
                        image: { objectFit: 'contain' }
                    }}
                >
                    {appName.slice(0, 2).toUpperCase()}
                </Avatar>
                <Text
                    component="span"
                    inherit
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                    {appName}
                </Text>
            </Group>
        ) : null

    const getAppDescription = (
        app: IAppConfig | null,
        step: 'addSubscriptionStep' | 'connectAndUseStep' | 'installationStep'
    ) => {
        if (!app) return ''

        const stepData = app[step]
        if (!stepData) return ''

        return stepData.description[currentLang] || ''
    }

    const getButtonText = (button: { buttonText: ILocalizedText }) => {
        return button.buttonText[currentLang] || ''
    }

    const getStepTitle = (stepData: { title?: ILocalizedText }, defaultTitle: string) => {
        if (!stepData || !stepData.title) return defaultTitle

        return stepData.title[currentLang] || defaultTitle
    }

    return (
        <Box>
            <Stack gap="sm">
                <StepCard
                    isMobile={isMobile}
                    title={
                        <Group gap={8} wrap="wrap">
                            <Text component="span" inherit>
                                {t('installation-guide.widget.step1-install')}
                            </Text>
                            {appTitleBadge}
                        </Group>
                    }
                    description={
                        selectedApp ? getAppDescription(selectedApp, 'installationStep') : ''
                    }
                >
                    {selectedApp && renderFirstStepButton(selectedApp)}
                </StepCard>

                {selectedApp && selectedApp.additionalBeforeAddSubscriptionStep && (
                    <StepCard
                        isMobile={isMobile}
                        title={getStepTitle(
                            selectedApp.additionalBeforeAddSubscriptionStep,
                            'Additional step title is not set'
                        )}
                        description={
                            selectedApp.additionalBeforeAddSubscriptionStep.description[
                            currentLang
                            ] || selectedApp.additionalBeforeAddSubscriptionStep.description.en
                        }
                    >
                        <Group gap="xs" wrap="wrap">
                            {selectedApp.additionalBeforeAddSubscriptionStep.buttons.map(
                                (button, index) => (
                                    <Button
                                        component="a"
                                        href={button.buttonLink}
                                        key={index}
                                        target="_blank"
                                        variant="light"
                                        radius="md"
                                        size="sm"
                                    >
                                        {getButtonText(button)}
                                    </Button>
                                )
                            )}
                        </Group>
                    </StepCard>
                )}

                <StepCard
                    isMobile={isMobile}
                    title={
                        <Group gap={8} wrap="wrap">
                            <Text component="span" inherit>
                                {t('installation-guide.widget.step2-add-config')}
                            </Text>
                            {appTitleBadge}
                        </Group>
                    }
                    description={
                        selectedApp
                            ? getAppDescription(selectedApp, 'addSubscriptionStep')
                            : 'Add subscription description is not set'
                    }
                >
                    {selectedApp && (
                        <Button
                            onClick={() =>
                                openDeepLink(
                                    selectedApp.urlScheme,
                                    selectedApp.isNeedBase64Encoding
                                )
                            }
                            variant="light"
                            radius="md"
                            leftSection={<IconExternalLink size={16} />}
                            size="sm"
                        >
                            {t('installation-guide.widget.add-subscription-button')}
                        </Button>
                    )}
                </StepCard>

                {selectedApp && selectedApp.additionalAfterAddSubscriptionStep && (
                    <StepCard
                        isMobile={isMobile}
                        title={getStepTitle(
                            selectedApp.additionalAfterAddSubscriptionStep,
                            'Additional step title is not set'
                        )}
                        description={
                            selectedApp.additionalAfterAddSubscriptionStep.description[
                            currentLang
                            ] || selectedApp.additionalAfterAddSubscriptionStep.description.en
                        }
                    >
                        <Group gap="xs" wrap="wrap">
                            {selectedApp.additionalAfterAddSubscriptionStep.buttons.map(
                                (button, index) => (
                                    <Button
                                        component="a"
                                        href={button.buttonLink}
                                        key={index}
                                        target="_blank"
                                        variant="light"
                                        radius="md"
                                        size="sm"
                                    >
                                        {getButtonText(button)}
                                    </Button>
                                )
                            )}
                        </Group>
                    </StepCard>
                )}

                <StepCard
                    isMobile={isMobile}
                    title={
                        <Group gap={8} wrap="wrap">
                            <Text component="span" inherit>
                                {t('installation-guide.widget.step3-connect-and-use')}
                            </Text>
                            {appTitleBadge}
                        </Group>
                    }
                    description={
                        selectedApp
                            ? getAppDescription(selectedApp, 'connectAndUseStep')
                            : 'Connect and use description is not set'
                    }
                />
            </Stack>
        </Box>
    )
}
