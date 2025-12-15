import { Controller, Get, Logger, Param } from '@nestjs/common';

import { AxiosService } from '@common/axios/axios.service';

@Controller('api')
export class DevApiController {
    private readonly logger = new Logger(DevApiController.name);

    constructor(private readonly axiosService: AxiosService) {}

    /**
     * Dev helper endpoint for local frontend development (Vite).
     * Returns the same payload that is normally embedded into SSR HTML as panelData.
     */
    @Get('subscription-info/:shortUuid')
    async getSubscriptionInfo(@Param('shortUuid') shortUuid: string) {
        const resp = await this.axiosService.getSubscriptionInfo('127.0.0.1', shortUuid);

        if (!resp.isOk || !resp.response) {
            this.logger.error(`Get subscription info failed, shortUuid: ${shortUuid}`);
            return { ok: false };
        }

        return resp.response;
    }
}


