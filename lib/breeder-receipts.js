/** Build and merge editable deposit / payment receipts for the breeding portal. */

export const RECEIPT_TYPES = ["deposit", "final"];

export function newItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatAddress(breeder) {
  return [breeder.address, breeder.town, breeder.county, breeder.postcode].filter(Boolean).join(", ");
}

function formatDateGB(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatMoney(value) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return `£${n.toFixed(2)}`;
}

function parseMoney(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[£,\s]/g, ""));
  return Number.isNaN(n) ? null : n;
}

export function defaultReceiptSettings() {
  return {
    deposit: {
      title: "Deposit Receipt",
      intro: "Thank you for your deposit. Please keep this receipt for your records.",
      footerNotes:
        "This deposit is taken to reserve your puppy/kitten. Balance is due on collection unless agreed otherwise. Please contact us if your circumstances change.",
      paragraphs: [
        {
          id: newItemId(),
          text: "The deposit is non-refundable if you change your mind, unless we agree otherwise in writing.",
          included: true,
        },
        {
          id: newItemId(),
          text: "The animal will remain with us until the agreed go-home date and full payment is received.",
          included: true,
        },
      ],
      lineItemLabels: {
        deposit: "Deposit received",
        balance: "Balance due on collection",
      },
    },
    final: {
      title: "Payment Receipt",
      intro: "Thank you for your payment. Please keep this receipt for your records.",
      footerNotes:
        "We hope your new family member brings you years of joy. Please retain this receipt and any insurance documents provided.",
      paragraphs: [
        {
          id: newItemId(),
          text: "Payment received in full. Ownership transfers on collection unless agreed otherwise.",
          included: true,
        },
      ],
      lineItemLabels: {
        salePrice: "Sale price",
        depositPaid: "Deposit previously paid",
        balancePaid: "Balance paid today",
      },
    },
  };
}

function mergeSettings(saved) {
  const defaults = defaultReceiptSettings();
  if (!saved || typeof saved !== "object") return defaults;
  return {
    deposit: { ...defaults.deposit, ...(saved.deposit || {}) },
    final: { ...defaults.final, ...(saved.final || {}) },
  };
}

function buildBreederBlock(breeder, overrides = {}) {
  return {
    name: overrides.name ?? breeder.name ?? "",
    address: overrides.address ?? formatAddress(breeder),
    phone: overrides.phone ?? breeder.phone ?? "",
    email: overrides.email ?? breeder.email ?? "",
    website: overrides.website ?? breeder.website ?? "",
    councilLicence: overrides.councilLicence ?? breeder.council_licence ?? "",
    kennelClub: overrides.kennelClub ?? breeder.kennel_club ?? "",
  };
}

function buildBuyerBlock(pup, overrides = {}) {
  return {
    name: overrides.name ?? pup.buyer_name ?? "",
    email: overrides.email ?? pup.buyer_email ?? "",
    phone: overrides.phone ?? pup.buyer_phone ?? "",
    address: overrides.address ?? pup.buyer_address ?? "",
  };
}

function buildAnimalBlock(pup, litter, overrides = {}) {
  return {
    name: overrides.name ?? pup.name ?? "",
    breed: overrides.breed ?? litter?.breed ?? "",
    sex: overrides.sex ?? pup.sex ?? "",
    colour: overrides.colour ?? pup.colour ?? "",
    microchip: overrides.microchip ?? pup.microchip ?? "",
    goHomeDate: overrides.goHomeDate ?? formatDateGB(pup.go_home_date || litter?.expected_go_home_date),
  };
}

function buildDepositLineItems(pup, settings) {
  const salePrice = parseMoney(pup.sale_price);
  const deposit = parseMoney(pup.deposit_amount);
  const balance =
    salePrice != null && deposit != null ? Math.max(0, salePrice - deposit) : null;

  return [
    {
      id: newItemId(),
      description: settings.lineItemLabels?.deposit || "Deposit received",
      amount: deposit,
      amountDisplay: formatMoney(deposit),
      included: true,
    },
    {
      id: newItemId(),
      description: settings.lineItemLabels?.balance || "Balance due on collection",
      amount: balance,
      amountDisplay: formatMoney(balance),
      included: salePrice != null,
    },
  ];
}

function buildFinalLineItems(pup, settings) {
  const salePrice = parseMoney(pup.sale_price);
  const deposit = parseMoney(pup.deposit_amount);
  const balance =
    salePrice != null && deposit != null ? Math.max(0, salePrice - deposit) : salePrice;

  return [
    {
      id: newItemId(),
      description: settings.lineItemLabels?.salePrice || "Sale price",
      amount: salePrice,
      amountDisplay: formatMoney(salePrice),
      included: salePrice != null,
    },
    {
      id: newItemId(),
      description: settings.lineItemLabels?.depositPaid || "Deposit previously paid",
      amount: deposit != null ? -deposit : null,
      amountDisplay: deposit != null ? `-£${deposit.toFixed(2)}` : "",
      included: deposit != null,
    },
    {
      id: newItemId(),
      description: settings.lineItemLabels?.balancePaid || "Balance paid today",
      amount: balance,
      amountDisplay: formatMoney(balance),
      included: true,
    },
  ];
}

export function buildReceiptDraft({ type, breeder, pup, litter, receiptSettings, savedDraft }) {
  if (!RECEIPT_TYPES.includes(type)) {
    throw new Error("Invalid receipt type.");
  }

  const settings = mergeSettings(receiptSettings)[type];
  const receiptDate =
    type === "deposit"
      ? formatDateGB(pup.deposit_date || new Date().toISOString().slice(0, 10))
      : formatDateGB(pup.final_payment_date || pup.sold_date || new Date().toISOString().slice(0, 10));

  const base = {
    type,
    title: settings.title,
    intro: settings.intro,
    footerNotes: settings.footerNotes,
    receiptDate,
    receiptNumber: `${type === "deposit" ? "DEP" : "PAY"}-${String(pup.id).slice(0, 8).toUpperCase()}`,
    breeder: buildBreederBlock(breeder),
    buyer: buildBuyerBlock(pup),
    animal: buildAnimalBlock(pup, litter),
    paragraphs: (settings.paragraphs || []).map((p) => ({ ...p, included: p.included !== false })),
    lineItems:
      type === "deposit" ? buildDepositLineItems(pup, settings) : buildFinalLineItems(pup, settings),
  };

  if (!savedDraft || typeof savedDraft !== "object") return base;

  return {
    ...base,
    ...savedDraft,
    breeder: { ...base.breeder, ...(savedDraft.breeder || {}) },
    buyer: { ...base.buyer, ...(savedDraft.buyer || {}) },
    animal: { ...base.animal, ...(savedDraft.animal || {}) },
    lineItems: savedDraft.lineItems || base.lineItems,
    paragraphs: savedDraft.paragraphs || base.paragraphs,
  };
}

export function activeLineItems(draft) {
  return (draft.lineItems || []).filter((item) => item.included !== false);
}

export function receiptTotalDisplay(draft) {
  const items = activeLineItems(draft);
  if (draft.type === "deposit") {
    const deposit = items.find((i) => i.description.toLowerCase().includes("deposit received"));
    return deposit?.amountDisplay || formatMoney(deposit?.amount);
  }
  const paidToday = items.find((i) => i.description.toLowerCase().includes("balance paid"));
  return paidToday?.amountDisplay || formatMoney(paidToday?.amount);
}

export function sanitizeReceiptDraft(draft) {
  if (!draft || typeof draft !== "object") return null;
  return {
    type: draft.type,
    title: String(draft.title || "").slice(0, 200),
    intro: String(draft.intro || "").slice(0, 2000),
    footerNotes: String(draft.footerNotes || "").slice(0, 4000),
    receiptDate: String(draft.receiptDate || "").slice(0, 100),
    receiptNumber: String(draft.receiptNumber || "").slice(0, 100),
    breeder: {
      name: String(draft.breeder?.name || "").slice(0, 200),
      address: String(draft.breeder?.address || "").slice(0, 500),
      phone: String(draft.breeder?.phone || "").slice(0, 50),
      email: String(draft.breeder?.email || "").slice(0, 200),
      website: String(draft.breeder?.website || "").slice(0, 200),
      councilLicence: String(draft.breeder?.councilLicence || "").slice(0, 100),
      kennelClub: String(draft.breeder?.kennelClub || "").slice(0, 200),
    },
    buyer: {
      name: String(draft.buyer?.name || "").slice(0, 200),
      email: String(draft.buyer?.email || "").slice(0, 200),
      phone: String(draft.buyer?.phone || "").slice(0, 50),
      address: String(draft.buyer?.address || "").slice(0, 500),
    },
    animal: {
      name: String(draft.animal?.name || "").slice(0, 200),
      breed: String(draft.animal?.breed || "").slice(0, 200),
      sex: String(draft.animal?.sex || "").slice(0, 20),
      colour: String(draft.animal?.colour || "").slice(0, 100),
      microchip: String(draft.animal?.microchip || "").slice(0, 100),
      goHomeDate: String(draft.animal?.goHomeDate || "").slice(0, 100),
    },
    lineItems: (draft.lineItems || []).slice(0, 20).map((item) => ({
      id: String(item.id || newItemId()),
      description: String(item.description || "").slice(0, 300),
      amount: parseMoney(item.amount),
      amountDisplay: String(item.amountDisplay || formatMoney(item.amount)).slice(0, 50),
      included: item.included !== false,
    })),
    paragraphs: (draft.paragraphs || []).slice(0, 20).map((p) => ({
      id: String(p.id || newItemId()),
      text: String(p.text || "").slice(0, 2000),
      included: p.included !== false,
    })),
  };
}

export function draftToTemplateSettings(draft) {
  return {
    title: draft.title,
    intro: draft.intro,
    footerNotes: draft.footerNotes,
    paragraphs: draft.paragraphs,
  };
}
