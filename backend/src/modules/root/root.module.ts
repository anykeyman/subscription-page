import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { getJWTConfig } from '@common/config/jwt/jwt.config';

import { RootController } from './root.controller';
import { DevApiController } from './dev-api.controller';
import { RootService } from './root.service';

@Module({
    imports: [JwtModule.registerAsync(getJWTConfig())],
    controllers: [RootController, DevApiController],
    providers: [RootService],
})
export class RootModule {}
