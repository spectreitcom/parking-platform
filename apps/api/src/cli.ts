import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule, ['error', 'warn', 'log']);
}

bootstrap().catch((e) => console.error(e));
