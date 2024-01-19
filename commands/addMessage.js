async function addMessage({ messageObject }) {
  //console.log(messageObject);
  try {
    const date = new Date();
    const ruDate = date.toLocaleString("ru");
    await messages.insertOne({ ...messageObject, date: ruDate });
  } catch (err) {
    console.log("Error " + err);
  }
}

module.exports = {
  addMessage,
};
