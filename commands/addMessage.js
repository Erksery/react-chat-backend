const { ObjectId } = require("mongodb");

async function addMessage({ messageObject }) {
  try {
    const messageDoc = await messages.insertOne(messageObject);
  } catch (err) {
    console.log("Error " + err);
  }
}

module.exports = {
  addMessage,
};
