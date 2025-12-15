import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { validateEnvConfig } from '@common/utils/validate-env-config';
import { configSchema, Env } from '@common/config/app-config';
import { AxiosModule } from '@common/axios/axios.module';

import { SubscriptionPageBackendModule } from '@modules/subscription-page-backend.modules';

@Module({
    imports: [
        AxiosModule,
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            // Support both docker/prod (.env next to backend runtime) and local dev from /backend
            // with a root-level .env (../.env).
            envFilePath: ['.env', '../.env'],
            validate: (config) => validateEnvConfig<Env>(configSchema, config),
        }),

        SubscriptionPageBackendModule,
    ],
})
export class AppModule {}
