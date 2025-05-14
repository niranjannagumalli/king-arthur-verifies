import nacl from "https://esm.sh/tweetnacl@v1.0.3?dts";
import { DISCORD_PUBLIC_KEY } from "./env.ts";

export async function verifySignature(
  request: Request,
): Promise<{ valid: boolean; body: string }> {
  const publicKey = DISCORD_PUBLIC_KEY!;
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(publicKey),
  );

  return { valid, body };
}

function hexToUint8Array(hex: string) {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)),
  );
}
