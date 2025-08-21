import { Crypto } from "@peculiar/webcrypto";

// Returns a promise that resolves to true if valid, false if not
export async function validatePrivateKey(pem: string): Promise<boolean> {
  try {
    const crypto = new Crypto();
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pem
      .replace(/\r?\n/g, "")
      .replace(pemHeader, "")
      .replace(pemFooter, "");
    const binaryDer = window.atob(pemContents);
    const binaryDerBuf = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerBuf[i] = binaryDer.charCodeAt(i);
    }
    await crypto.subtle.importKey(
      "pkcs8",
      binaryDerBuf,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    return true;
  } catch {
    return false;
  }
}

export async function validatePublicKey(pem: string): Promise<boolean> {
  try {
    const crypto = new Crypto();
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem
      .replace(/\r?\n/g, "")
      .replace(pemHeader, "")
      .replace(pemFooter, "");
    const binaryDer = window.atob(pemContents);
    const binaryDerBuf = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerBuf[i] = binaryDer.charCodeAt(i);
    }
    await crypto.subtle.importKey(
      "spki",
      binaryDerBuf,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return true;
  } catch {
    return false;
  }
}
