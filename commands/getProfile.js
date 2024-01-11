const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

function getProfile({ token, res }) {
  try {
    if (token) {
      jwt.verify(token, secretKey, (err, userData) => {
        if (err) console.log("ERROR: " + err);
        res
          .status(200)
          .json({ ...userData, message: "Авторизация прошла успешно" });
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
