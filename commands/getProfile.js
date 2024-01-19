const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");
async function getProfile({ token, res }) {
  try {
    if (token) {
      jwt.verify(token, secretKey, async (err, userData) => {
        if (err) console.log("ERROR: " + err);
        const profileUser = await users.findOne({
          loginUser: userData.userLogin,
        });

        res
          .status(200)
          .json({
            userId: profileUser._id,
            userLogin: profileUser.loginUser,
            avatarColor: profileUser.avatarColor,
            message: "Авторизация прошла успешно",
          });
      });
    } else {
      res.status(401).json({ error: "Вы не авторизованы" });
    }
  } catch (err) {
    res.status(401).json({ error: "Ваш токен не действителен" });
  }
}

module.exports = {
  getProfile,
};
