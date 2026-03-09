import { Command, CommandRunner, Option } from 'nest-commander';
import { PasswordService } from '../../ports/password.service';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { AdminUser } from '../../../domain/admin-user';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';

interface Options {
  email: string;
  password: string;
  displayName: string;
}

@Command({ name: 'generate-super-admin', description: 'Generate super admin' })
export class GenerateSuperAdminCliCommand extends CommandRunner {
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
      console.error('Email, password and display name are required');
      return;
    }

    const existingAdmin = await this.adminUserRepository.findByEmail(email);
    if (existingAdmin) {
      console.error(`Admin with email ${email} already exists`);
      return;
    }

    const passwordHash = await this.passwordService.create(password);
    const superAdmin = AdminUser.createSuperAdmin(
      email,
      displayName,
      passwordHash,
    );

    await this.adminUserRepository.save(superAdmin, { isNew: true });

    console.log(`Super admin ${email} generated successfully`);
  }

  @Option({
    flags: '-e, --email <string>',
    description: 'Admin email',
  })
  parseEmail(val: string): string {
    const _email = Email.fromString(val);
    return _email.value;
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
    const _displayName = AdminDisplayName.fromString(val);
    return _displayName.value;
  }
}
