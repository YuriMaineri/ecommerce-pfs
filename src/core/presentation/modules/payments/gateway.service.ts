import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Simulador de gateway de pagamento. Decide o desfecho a partir de cartoes de
 * teste e, de forma assincrona, chama o webhook do proprio backend (como um
 * gateway real faria). Demonstra o desacoplamento via webhook.
 */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  /** Cartao de teste que sempre recusa (estilo Stripe). */
  private static readonly DECLINE_CARD = '4000000000000002';

  constructor(private readonly config: ConfigService) {}

  /** Regras determinísticas de cartao de teste. */
  decideApproval(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits === GatewayService.DECLINE_CARD) {
      return false;
    }
    // Qualquer numero "valido" (13-19 digitos) aprova; caso contrario, recusa.
    return digits.length >= 13 && digits.length <= 19;
  }

  /**
   * Agenda a notificacao do webhook (assincrona, simulando o processamento do
   * gateway). Nao bloqueia a resposta ao cliente.
   */
  scheduleWebhook(reference: string, approved: boolean): void {
    const appUrl =
      this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    const token = this.config.get<string>('PAYMENT_WEBHOOK_TOKEN');
    const url = `${appUrl}/webhooks/payments`;
    const status = approved ? 'approved' : 'declined';

    setTimeout(() => {
      void fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { 'x-webhook-token': token } : {}),
        },
        body: JSON.stringify({ reference, status }),
      })
        .then((res) => {
          if (!res.ok) {
            this.logger.error(
              `Webhook call failed (${res.status}) for reference ${reference}`,
            );
          } else {
            this.logger.log(
              `Webhook notified: reference=${reference} status=${status}`,
            );
          }
        })
        .catch((err) => {
          this.logger.error(
            `Webhook call error for reference ${reference}: ${String(err)}`,
          );
        });
    }, 1500);
  }
}
