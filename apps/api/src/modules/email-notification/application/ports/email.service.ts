import { Email } from '../email';

export abstract class EmailService {
  abstract send(email: Email): Promise<void>;
}
