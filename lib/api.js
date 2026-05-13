const TCGDEX_URL = "https://api.tcgdex.net/v2/en";

export async function getAllSets() {
  try {
    const res = await fetch(`${TCGDEX_URL}/sets`, { next: { revalidate: 86400 } });
    if (!res.ok) return {};
    const sets = await res.json();

    const eras = {};
    sets.forEach(set => {
      const eraName = set.serie?.name || "Other";
      if (!eras[eraName]) eras[eraName] = [];
      eras[eraName].push(set);
    });
    return eras;
  } catch (e) {
    return {};
  }
}

export async function getSetCards(setId) {
  try {
    const res = await fetch(`${TCGDEX_URL}/sets/${setId}`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.cards?.slice(0, 8) || [];
  } catch (e) {
    return [];
  }
}

export function getEbayLink(cardName, setName) {
  const query = encodeURIComponent(`${cardName} ${setName} pokemon card`);
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${query}&LH_BIN=1`;
}

export function getTCGPlayerLink(cardName) {
  const query = encodeURIComponent(`${cardName} pokemon`);
  return `https://www.tcgplayer.com/search/pokemon/product?q=${query}`;
}
