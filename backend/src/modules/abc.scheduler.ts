import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SgeService } from './sge.service';

@Injectable()
export class AbcScheduler {
  private readonly logger = new Logger(AbcScheduler.name);

  constructor(private readonly sgeService: SgeService) {}

  // Ejecuta el primer dia de cada mes a las 02:00.
  @Cron('0 2 1 * *')
  async handleMonthlyAbc() {
    await this.sgeService.recomputeAbc();
    this.logger.log('Clasificacion ABC mensual recalculada.');
  }
}
