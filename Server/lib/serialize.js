const toUser = (user) => {
  if (!user) return null;
  const { password, createdAt, updatedAt, ...rest } = user;
  return rest;
};

const toMessage = (message) => {
  if (!message) return null;
  const { senderId, recipientId, sender, recipient, ...rest } = message;

  return {
    ...rest,
    sender: sender ? toUser(sender) : senderId,
    recipient: recipient ? toUser(recipient) : recipientId,
  };
};

module.exports = { toUser, toMessage };
