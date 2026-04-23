export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public quantity: number,
    public readonly unitPrice: number,
    public subtotal: number,
  ) {}

  recalculateSubtotal(): void {
    this.subtotal = this.quantity * this.unitPrice;
  }

  static computeSubtotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }
}
