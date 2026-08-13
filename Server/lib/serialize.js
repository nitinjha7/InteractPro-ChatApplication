// client still expects mongo-shaped payloads (_id, populated sender/recipient).
// keeping that contract here means the frontend doesn't change until it's ported to TS.

const toUser = (user) => {
  if (!user) return null;
  const { id, password, createdAt, updatedAt, ...rest } = user;
  return { _id: id, ...rest };
};

const toMessage = (message) => {
  if (!message) return null;
  const { id, senderId, recipientId, sender, recipient, ...rest } = message;

  return {
    _id: id,
    ...rest,
    sender: sender ? toUser(sender) : senderId,
    recipient: recipient ? toUser(recipient) : recipientId,
  };
};

module.exports = { toUser, toMessage };
