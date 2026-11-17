const OutboxEvent = require('../models/OutboxEvent');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { USER_SUMMARY_FIELDS } = require('../utils/userFields');

// Transactional outbox. Producers record events with enqueue() in the same
// transaction as their own writes; this worker then creates notifications and
// emits socket events. Delivery is at least once: a crash after an emit but
// before the event is marked done repeats the emit, so clients ignore
// duplicates by _id, and notifications are de-duplicated by event id.

const LOCK_MS = 30 * 1000;
const MAX_ATTEMPTS = 8;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
const POLL_MS = 1000;
const DRAIN_LIMIT = 100; // events per pass, so one pass cannot run forever

let io = null;
let started = false;
let draining = false;
let drainAgain = false;

// events: [{ type, payload }]. Pass the caller's transaction session.
const enqueue = (events, session = null) =>
  OutboxEvent.create(
    events.map(({ type, payload }) => ({ type, payload })),
    { session, ordered: true }
  );

const handlers = {
  'notification.create': async (event) => {
    const notification = await Notification.findOneAndUpdate(
      { sourceEvent: event._id },
      { $setOnInsert: { ...event.payload, sourceEvent: event._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    io?.to(`user_${notification.recipient}`).emit('new-notification', notification);
  },

  'chat.message': async (event) => {
    const message = await Message.findById(event.payload.messageId)
      .populate('sender', USER_SUMMARY_FIELDS)
      .populate('receiver', USER_SUMMARY_FIELDS);
    if (!message) return; // removed since; nothing to deliver
    io?.to(`exchange_${message.exchange}`).emit('receive-message', message);
  },
};

const claimNext = async () => {
  const now = new Date();
  return OutboxEvent.findOneAndUpdate(
    {
      $or: [
        { status: 'pending', availableAt: { $lte: now } },
        { status: 'processing', lockedUntil: { $lt: now } }, // worker died mid-event
      ],
    },
    { $set: { status: 'processing', lockedUntil: new Date(now.getTime() + LOCK_MS) }, $inc: { attempts: 1 } },
    { sort: { availableAt: 1, _id: 1 }, new: true }
  );
};

const processEvent = async (event) => {
  // Only the worker that still holds this claim may settle the event
  const claim = { _id: event._id, status: 'processing', lockedUntil: event.lockedUntil };

  try {
    const handler = handlers[event.type];
    if (!handler) throw new Error(`No outbox handler for ${event.type}`);
    await handler(event);
    await OutboxEvent.updateOne(claim, {
      $set: { status: 'done', processedAt: new Date() },
      $unset: { lockedUntil: '', lastError: '' },
    });
  } catch (error) {
    const giveUp = event.attempts >= MAX_ATTEMPTS;
    const backoff = Math.min(1000 * 2 ** event.attempts, MAX_BACKOFF_MS);
    await OutboxEvent.updateOne(claim, {
      $set: {
        status: giveUp ? 'failed' : 'pending',
        availableAt: new Date(Date.now() + backoff),
        lastError: String(error.message).slice(0, 500),
      },
      $unset: { lockedUntil: '' },
    });
    if (giveUp) console.error(`[Outbox] Event ${event._id} (${event.type}) failed permanently: ${error.message}`);
  }
};

// Processes due events one at a time, in order. Calls made while a pass is
// running schedule one more pass instead of running concurrently.
const drainOutbox = async () => {
  if (draining) {
    drainAgain = true;
    return;
  }
  draining = true;
  try {
    do {
      drainAgain = false;
      for (let i = 0; i < DRAIN_LIMIT; i++) {
        const event = await claimNext();
        if (!event) break;
        await processEvent(event);
      }
    } while (drainAgain);
  } catch (error) {
    console.error('[Outbox] Drain failed:', error.message);
  } finally {
    draining = false;
  }
};

// Called by producers after their transaction commits, so live events go out
// immediately instead of waiting for the next poll
const kickOutbox = () => {
  if (started) setImmediate(drainOutbox);
};

// Emits reach sockets on this process only; several instances need a shared
// Socket.IO adapter (see the scalability plan).
const startOutboxWorker = (socketServer) => {
  io = socketServer;
  started = true;
  setInterval(drainOutbox, POLL_MS).unref();
  drainOutbox();
};

const setOutboxIo = (socketServer) => {
  io = socketServer;
};

module.exports = { enqueue, kickOutbox, drainOutbox, startOutboxWorker, setOutboxIo, MAX_ATTEMPTS };
