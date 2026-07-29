export interface OfflineTicketPayload {
  ticketId: string;
  abssin: string;
  fareCharged: number;
  timestamp: number;
  conductorId: string;
  routeId: string;
}

export interface SecuredOfflineTicket extends OfflineTicketPayload {
  verificationHash: string;
}

export async function generateSecuredTicket(
  payload: OfflineTicketPayload,
  deviceSecretKey: string,
): Promise<SecuredOfflineTicket> {
  const dataString = `${payload.ticketId}:${payload.abssin}:${payload.fareCharged}:${payload.timestamp}:${deviceSecretKey}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const verificationHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { ...payload, verificationHash };
}

export function verifyTicketIntegrity(
  ticket: SecuredOfflineTicket,
  deviceSecretKey: string,
): boolean {
  const dataString = `${ticket.ticketId}:${ticket.abssin}:${ticket.fareCharged}:${ticket.timestamp}:${deviceSecretKey}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);
  let result = '';
  crypto.subtle.digest('SHA-256', dataBuffer).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    result = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  });
  return result === ticket.verificationHash;
}
