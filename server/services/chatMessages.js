const Message = require('../models/Message');
const { runInTransaction } = require('../utils/transactions');
const { enqueue, kickOutbox } = require('./outbox');

const PREVIEW_LENGTH = 40;

// Saves a chat message together with the outbox events that deliver it live and
// notify the receiver, so the message never exists without its delivery. Used
// by both the REST endpoint and the socket handler. Callers have already
// checked participation and that chat is open.
const createChatMessage = async ({ exchange, sender, receiverId, text }) => {
  const message = await runInTransaction(async (session) => {
    const [created] = await Message.create(
      [{ exchange: exchange._id, sender: sender._id, receiver: receiverId, content: text }],
      { session }
    );

    await enqueue(
      [
        { type: 'chat.message', payload: { messageId: created._id } },
        {
          type: 'notification.create',
          payload: {
            recipient: receiverId,
            sender: sender._id,
            type: 'new_message',
            title: 'New Message',
            message: `${sender.name}: "${text.slice(0, PREVIEW_LENGTH)}${text.length > PREVIEW_LENGTH ? '...' : ''}"`,
            link: '/messages',
          },
        },
      ],
      session
    );

    return created;
  });

  kickOutbox();
  return message;
};

module.exports = { createChatMessage };
