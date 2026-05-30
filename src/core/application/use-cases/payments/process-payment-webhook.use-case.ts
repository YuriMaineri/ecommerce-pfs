import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import {
  IPaymentRepository,
  WebhookResult,
} from '../../../domain/repositories/payment.repository.interface';

export interface ProcessPaymentWebhookInput {
  reference: string;
  approved: boolean;
}

@Injectable()
export class ProcessPaymentWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: IPaymentRepository,
  ) {}

  async execute(input: ProcessPaymentWebhookInput): Promise<WebhookResult> {
    return this.payments.applyWebhookResult(input.reference, input.approved);
  }
}
