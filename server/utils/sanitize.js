const MAX_SEARCH_LENGTH = 100;
const SEARCH_TIMEOUT_MS = 2000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Turns untrusted search input into a literal regex source. Query-string objects
// such as ?search[$ne]=x are treated as no search at all.
const toSearchPattern = (value) => {
  if (typeof value !== 'string') return '';
  return escapeRegex(value.trim().slice(0, MAX_SEARCH_LENGTH));
};

const exactNameRegex = (name) => new RegExp(`^${escapeRegex(name)}$`, 'i');

module.exports = { SEARCH_TIMEOUT_MS, toSearchPattern, exactNameRegex };
