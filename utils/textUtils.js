const STOPWORDS = new Set([
  "the","and","is","in","at","of","a","an","to","for","on","with","this","that",
  "it","by","from","as","are","be","or","we","you","your","our","will","can"
]);

export function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D'".,!?;:()\/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text = "") {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export function termFreq(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  return tf;
}

export function cosineLike(tfA, tfB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const k in tfA) normA += tfA[k] * tfA[k];
  for (const k in tfB) normB += tfB[k] * tfB[k];
  for (const k in tfA) {
    if (tfB[k]) dot += tfA[k] * tfB[k];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}