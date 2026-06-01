import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('Prisma no pudo conectarse a la base de datos al iniciar. El servidor seguirá levantado.', error?.message || error);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma library engine (>=5) does not support 'beforeExit' event handlers via
    // PrismaClient.$on. Attach to process.beforeExit instead to close Nest app.
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
