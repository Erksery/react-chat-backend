const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

async function searchUser({ searchValue, token, res }) {
  const projection = {
    _id: 1,
    loginUser: 1,
    regDate: 1,
    status: 1,
    avatarColor: 1,
  };

  try {
    const user = await users
      .find({ loginUser: { $regex: new RegExp(searchValue, "i") } })
      .project(projection)
      .toArray();

    jwt.verify(token, secretKey, (err, userData) => {
      const resultUsers = user.filter(
        (user) => user._id.toString() !== userData.userId
      );

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
