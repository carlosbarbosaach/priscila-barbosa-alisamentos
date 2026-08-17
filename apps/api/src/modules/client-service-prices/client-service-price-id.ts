export function buildClientServicePriceId(
    clientId: string,
    serviceId: string,
): string {
    return `${clientId}_${serviceId}`;
}