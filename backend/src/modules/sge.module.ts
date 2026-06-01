import { Module } from '@nestjs/common';
import { SgeController } from './sge.controller';
import { SgeService } from './sge.service';
import { AbcScheduler } from './abc.scheduler';

@Module({
  controllers: [SgeController],
  providers: [SgeService, AbcScheduler],
})
export class SgeModule {}
