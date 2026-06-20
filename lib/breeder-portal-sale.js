/** Sale checklist fields for breeding portal pups (Gold tier). */

export const PUP_BASIC_FIELDS = ["name", "sex", "colour", "microchip", "status", "sold_date", "notes", "sort_order"];

export const PUP_SALE_FIELDS = [
  "buyer_name",
  "buyer_email",
  "buyer_phone",
  "buyer_address",
  "deposit_received",
  "deposit_date",
  "deposit_amount",
  "paid_in_full",
  "final_payment_date",
  "sale_price",
  "free_food_provided",
  "insurance_provided",
  "insurance_policy_number",
  "insurance_provider",
  "go_home_date",
];

export const SALE_CHECKLIST_ITEMS = [
  { key: "deposit_received", label: "Deposit received" },
  { key: "paid_in_full", label: "Paid in full" },
  { key: "free_food_provided", label: "Free food provided" },
  { key: "insurance_provided", label: "Insurance arranged" },
];

export function canUseSaleFeatures(access) {
  return access?.level === "full";
}

export function goldSaleRequiredResponse() {
  return {
    error: "Sale records, receipts, and council summaries are included with Gold. Upgrade to unlock.",
    goldRequired: true,
    status: 403,
  };
}

export function saleChecklistProgress(pup) {
  const done = SALE_CHECKLIST_ITEMS.filter((item) => pup?.[item.key]).length;
  return { done, total: SALE_CHECKLIST_ITEMS.length };
}

export function formatMoney(value) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return n.toFixed(2);
}
