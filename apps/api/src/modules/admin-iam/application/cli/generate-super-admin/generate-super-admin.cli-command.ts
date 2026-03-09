import { Command, CommandRunner, Option } from 'nest-commander';
import { PasswordService } from '../../ports/password.service';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { AdminUser } from '../../../domain/admin-user';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { Logger } from '@nestjs/common';

interface Options {
  email: string;
  password: string;
  displayName: string;
}

@Command({ name: 'generate-super-admin', description: 'Generate super admin' })
export class GenerateSuperAdminCliCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateSuperAdminCliCommand.name);

  constructor(
    private readonly passwordService: PasswordService,
    private readonly adminUserRepository: AdminUserRepository,
  ) {
    super();
  }

  async run(passedParams: string[], options?: Options): Promise<void> {
    const email = options?.email;
    const password = options?.password;
    const displayName = options?.displayName;

    if (!email || !password || !displayName) {
      this.logger.error('Email, password and display name are required');
      process.exit(1);
    }

    const existingAdmin = await this.adminUserRepository.findByEmail(email);
    if (existingAdmin) {
      this.logger.error(`Admin with email ${email} already exists`);
      process.exit(1);
    }

    const passwordHash = await this.passwordService.create(password);
    const superAdmin = AdminUser.createSuperAdmin(
      email,
      displayName,
      passwordHash,
    );

    await this.adminUserRepository.save(superAdmin, { isNew: true });

    this.logger.log(`Super admin ${email} generated successfully`);
  }

  @Option({
    flags: '-e, --email <string>',
    description: 'Admin email',
  })
  parseEmail(val: string): string {
    try {
      const _email = Email.fromString(val);
      return _email.value;
    } catch {
      this.logger.error(`Invalid email format: ${val}`);
      process.exit(1);
    }
  }

  @Option({
    flags: '-p, --password <string>',
    description: 'Admin password',
  })
  parsePassword(val: string): string {
    return val;
  }

  @Option({
    flags: '-d, --displayName <string>',
    description: 'Admin display name',
  })
  parseDisplayName(val: string): string {
    try {
      const _displayName = AdminDisplayName.fromString(val);
      return _displayName.value;
    } catch {
      this.logger.error(`Invalid display name format: ${val}`);
      process.exit(1);
    }
  }
}
