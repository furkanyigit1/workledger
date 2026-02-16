export async function computePlaintextHash(plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(plaintext));
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPlaintextHash(
  plaintext: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await computePlaintextHash(plaintext);
  return actual === expectedHash;
}
