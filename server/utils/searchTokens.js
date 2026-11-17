// Prefix search. Searchable text is stored as lowercase word tokens in an
// indexed array, and each search word must be the start of some token. A regex
// anchored with ^ on a case-normalized field can use the index as a range scan,
// unlike the case-insensitive "contains" regexes this replaces.
//
// "React.js" stores react, js and reactjs, so "react", "js", "reactj" and
// "react js" all find it; "act" does not.

const MAX_TOKENS = 200; // per record, so a long bio cannot bloat the index
const MAX_QUERY_WORDS = 5;

// Lowercase, strip accents, then split on anything that is not a letter or digit
const words = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

// Tokens for one or more text fields: each word, plus each field with its
// punctuation and spaces removed, so joined forms like "reactjs" match too
const buildSearchTokens = (...fields) => {
  const tokens = new Set();
  for (const field of fields) {
    const parts = words(field);
    parts.forEach((w) => tokens.add(w));
    if (parts.length > 1) tokens.add(parts.join(''));
  }
  return [...tokens].slice(0, MAX_TOKENS);
};

// Exact-match key for a skill name: case, accents and repeated spaces do not
// matter, but punctuation does, so "C++", "C#" and "C" stay different skills
const normalizeName = (name) =>
  String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Filter clauses requiring every search word to prefix a token. Tokens contain
// only letters and digits, so the words need no regex escaping. Returns null
// when the input has no searchable words (including non-string input).
const prefixClauses = (query, field = 'searchTokens') => {
  if (typeof query !== 'string') return null;
  const terms = [...new Set(words(query.slice(0, 100)))].slice(0, MAX_QUERY_WORDS);
  if (!terms.length) return null;
  return terms.map((term) => ({ [field]: { $regex: `^${term}` } }));
};

module.exports = { buildSearchTokens, normalizeName, prefixClauses, words };
