const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

async function searchUser({ searchValue, token, res }) {
  const projection = {
    _id: 1,
    loginUser: 1,
    avatarColor: 1,
  };

  const projectionMessage = {
    text: 1,
    file: 1,
    sender: 1,
    recipient: 1,
  };

  try {
    const user = await users
      .find({ loginUser: { $regex: new RegExp(searchValue, "i") } })
      .project(projection)
      .toArray();

    jwt.verify(token, secretKey, async (err, userData) => {
      const resultUsers = user.filter(
        (user) => user._id.toString() !== userData.userId
      );
      const message = await messages
        .find({
          $or: [{ recipient: userData.userId }, { sender: userData.userId }],
        })
        .project(projectionMessage)
        .toArray();
      const reverseMessage = message.reverse();

      resultUsers.map((user) => {
        const test = reverseMessage.find(
          (el) =>
            el.recipient === user._id.toString() ||
            el.sender === user._id.toString()
        );

        user.lastMessageData = test;
        //console.log(test);
      });

      // console.log(message);

      res.json(resultUsers);
    });
  } catch (err) {
    console.log(err);
    res.json({ searchResult: "Нету такого" });
  }
}

module.exports = {
  searchUser,
};
