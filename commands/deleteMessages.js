const { ObjectId } = require("mongodb");
async function deleteMessages({ res, messagesArray, userData }) {
  try {
    messagesArray.map(async (message) => {
      console.log(message);
      const res = await messages.deleteOne({ _id: new ObjectId(message) });
      console.log(res);
    });
    res.status(200).json("Удаление завершенно");
  } catch (err) {
    res.status(400).json("Ошибка при попытке удаления");
  }
}

module.exports = {
  deleteMessages,
};
