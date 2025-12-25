export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
