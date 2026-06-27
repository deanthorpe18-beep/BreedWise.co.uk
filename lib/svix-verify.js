import crypto from "crypto";

/** Verify Resend/Svix webhook signature without extra dependencies */
export function verifySvixWebhook(payload, headers, secret) {
  if (!secret) return false;

  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const ts = parseInt(svixTimestamp, 10);
  if (Number.isNaN(ts)) return false;
  const age = Math.abs(Date.now() / 1000 - ts);
  if (age > 300) return false;

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const secretBytes = Buffer.from(secretKey, "base64");
  const expected = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");

  for (const part of svixSignature.split(" ")) {
    const [version, sig] = part.split(",");
    if (version === "v1" && sig === expected) return true;
  }
  return false;
}
