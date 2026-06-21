/** Shared helpers for cat/fish/dog seed scripts. */

async function loadExistingBreederKeys(supabase) {
  let all = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("breeders")
      .select("google_place_id, slug")
      .neq("status", "archived")
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    all = all.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  return all;
}

module.exports = { loadExistingBreederKeys };
