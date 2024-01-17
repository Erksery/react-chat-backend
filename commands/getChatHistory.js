const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");
async function getChatHistory({ res, selectChat, token, messagesLimit }) {
  try {
    if (token) {
      jwt.verify(token, secretKey, async (err, userData) => {
        if (err) console.log("ERROR: " + err);
        const dialogue = await messages
          .find({
            recipient: { $in: [userData.userId, selectChat] },
            sender: { $in: [userData.userId, selectChat] },
          })
          .sort({ _id: -1 })
          .limit(+messagesLimit)
          .toArray();
        const reverseResult = dialogue.reverse();

        if (dialogue !== null) {
          if (selectChat) {
            res.status(200).json(reverseResult);
          } else {
            res.status(200).json([]);
          }
        } else {
          res
            .status(400)
            .json({ error: "Вы еще не писали этому пользователю" });
        }
      });
    } else {
      res.status(401).json({ error: "Вы не авторизованы" });
    }
  } catch (err) {
    res.status(400).json({ error: "Ошибка при получении истории чата" });
  }
}
module.exports = {
  getChatHistory,
};
