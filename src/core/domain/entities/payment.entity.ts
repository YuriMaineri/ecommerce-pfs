import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public status: PaymentStatus,
    public readonly amount: number,
    public readonly provider: string,
    public readonly reference: string,
    public readonly createdAt: Date,
    public processedAt: Date | null,
  ) {}

  get isProcessed(): boolean {
    return this.status !== PaymentStatus.PENDING;
  }
}
