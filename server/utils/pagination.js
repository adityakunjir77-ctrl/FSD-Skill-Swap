const mongoose = require('mongoose');

// Cursor pagination for newest-first lists. A cursor encodes the sort value and
// _id of the last item returned, so the next page starts strictly after it even
// when several records share a timestamp.

class InvalidCursorError extends Error {
  constructor() {
    super('Invalid pagination cursor.');
    this.status = 400; // the error handler passes 4xx `status` errors through
  }
}

const parseLimit = (raw, { defaultLimit, maxLimit }) => {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 1) return defaultLimit;
  return Math.min(value, maxLimit);
};

const encodeCursor = (doc, field) =>
  Buffer.from(`${new Date(doc[field]).toISOString()}|${doc._id}`).toString('base64url');

const decodeCursor = (raw) => {
  if (raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' || raw.length > 100) throw new InvalidCursorError();

  const [iso, id] = Buffer.from(raw, 'base64url').toString('utf8').split('|');
  const value = new Date(iso);

  if (Number.isNaN(value.getTime()) || !mongoose.isValidObjectId(id) || String(id).length !== 24) {
    throw new InvalidCursorError();
  }

  return { value, id: new mongoose.Types.ObjectId(id) };
};

// Filter for records that sort after the cursor in { field: -1, _id: -1 } order
const olderThan = (field, cursor) =>
  cursor
    ? { $or: [{ [field]: { $lt: cursor.value } }, { [field]: cursor.value, _id: { $lt: cursor.id } }] }
    : {};

// Runs a newest-first page query. Fetches one extra row to learn whether more exist.
const findPage = async (model, filter, { field, cursorParam, limitParam, defaultLimit, maxLimit, build }) => {
  const limit = parseLimit(limitParam, { defaultLimit, maxLimit });
  const cursor = decodeCursor(cursorParam);
  const where = cursor ? { $and: [filter, olderThan(field, cursor)] } : filter;

  let query = model.find(where).sort({ [field]: -1, _id: -1 }).limit(limit + 1);
  if (build) query = build(query);
  const rows = await query;

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return {
    items,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore ? encodeCursor(items[items.length - 1], field) : null,
    },
  };
};

module.exports = { InvalidCursorError, parseLimit, encodeCursor, decodeCursor, olderThan, findPage };
