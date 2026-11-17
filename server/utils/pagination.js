const mongoose = require('mongoose');

// Cursor pagination. A cursor encodes the sort value and _id of the last item
// returned, so the next page starts strictly after it even when several
// records share a sort value. Lists sort by a date (newest first by default)
// or by a string such as a name (A-Z).

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

const encodeCursor = (doc, field, valueType = 'date') => {
  const value = valueType === 'date' ? new Date(doc[field]).toISOString() : String(doc[field]);
  return Buffer.from(JSON.stringify({ v: value, id: String(doc._id) })).toString('base64url');
};

const decodeCursor = (raw, valueType = 'date') => {
  if (raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' || raw.length > 400) throw new InvalidCursorError();

  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch (error) {
    throw new InvalidCursorError();
  }

  const { v, id } = parsed || {};
  if (typeof v !== 'string' || typeof id !== 'string' || !/^[0-9a-f]{24}$/i.test(id)) {
    throw new InvalidCursorError();
  }

  const value = valueType === 'date' ? new Date(v) : v;
  if (valueType === 'date' && Number.isNaN(value.getTime())) throw new InvalidCursorError();

  return { value, id: new mongoose.Types.ObjectId(id) };
};

// Filter for records that come after the cursor in { field: direction, _id: direction } order
const afterCursor = (field, cursor, direction = -1) => {
  if (!cursor) return {};
  const op = direction === -1 ? '$lt' : '$gt';
  return { $or: [{ [field]: { [op]: cursor.value } }, { [field]: cursor.value, _id: { [op]: cursor.id } }] };
};

// Runs one page query. Fetches one extra row to learn whether more exist.
const findPage = async (
  model,
  filter,
  { field, direction = -1, valueType = 'date', cursorParam, limitParam, defaultLimit, maxLimit, build }
) => {
  const limit = parseLimit(limitParam, { defaultLimit, maxLimit });
  const cursor = decodeCursor(cursorParam, valueType);
  const where = cursor ? { $and: [filter, afterCursor(field, cursor, direction)] } : filter;

  let query = model.find(where).sort({ [field]: direction, _id: direction }).limit(limit + 1);
  if (build) query = build(query);
  const rows = await query;

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return {
    items,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore ? encodeCursor(items[items.length - 1], field, valueType) : null,
    },
  };
};

module.exports = { InvalidCursorError, parseLimit, encodeCursor, decodeCursor, afterCursor, findPage };
