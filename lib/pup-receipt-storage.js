/** Shared scanned receipt upload / download for breeding portal pups. */

export const RECEIPT_TYPE_COLUMNS = {
  deposit: "deposit_receipt_path",
  final: "final_receipt_path",
};

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateReceiptFile(file) {
  if (!file) return "No file provided.";
  if (file.size > MAX_BYTES) return "File too large. Max 5MB.";
  if (!ALLOWED_TYPES.includes(file.type)) return "Only PDF, JPG, or PNG allowed.";
  return null;
}

export async function uploadPupReceipt(adminClient, { breederId, pupId, type, file }) {
  const column = RECEIPT_TYPE_COLUMNS[type];
  if (!column) throw new Error("Specify type=deposit or type=final.");

  const validation = validateReceiptFile(file);
  if (validation) throw new Error(validation);

  const { data: existing } = await adminClient
    .from("breeding_litter_animals")
    .select(`id, ${column}`)
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .maybeSingle();

  if (!existing) throw new Error("Pup not found.");

  const ext = file.name.split(".").pop().toLowerCase();
  const filePath = `portal-receipts/${breederId}/${pupId}/${type}-${Date.now()}.${ext}`;

  const { error: uploadError } = await adminClient.storage
    .from("claim-evidence")
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  if (existing[column]) {
    await adminClient.storage.from("claim-evidence").remove([existing[column]]);
  }

  const { data, error } = await adminClient
    .from("breeding_litter_animals")
    .update({ [column]: filePath, updated_at: new Date().toISOString() })
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPupReceiptUrl(adminClient, { breederId, pupId, type }) {
  const column = RECEIPT_TYPE_COLUMNS[type];
  if (!column) throw new Error("Specify type=deposit or type=final.");

  const { data: pup, error } = await adminClient
    .from("breeding_litter_animals")
    .select(column)
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!pup?.[column]) throw new Error("No receipt uploaded.");

  const { data: signed, error: signError } = await adminClient.storage
    .from("claim-evidence")
    .createSignedUrl(pup[column], 3600);

  if (signError) throw new Error(signError.message);
  return signed.signedUrl;
}

export async function deletePupReceipt(adminClient, { breederId, pupId, type }) {
  const column = RECEIPT_TYPE_COLUMNS[type];
  if (!column) throw new Error("Specify type=deposit or type=final.");

  const { data: pup } = await adminClient
    .from("breeding_litter_animals")
    .select(column)
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .maybeSingle();

  if (!pup?.[column]) throw new Error("No receipt to remove.");

  await adminClient.storage.from("claim-evidence").remove([pup[column]]);

  const { data, error } = await adminClient
    .from("breeding_litter_animals")
    .update({ [column]: null, updated_at: new Date().toISOString() })
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
