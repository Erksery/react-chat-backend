const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

async function registerUser({ enteredData, res }) {
  try {
    const condidate = await users.findOne({ loginUser: enteredData.login });
    if (condidate) {
      res
        .status(400)
        .json({ error: "Пользователь с таким именем уже существует" });
    } else {
      const date = new Date();
      const ruDate = date.toLocaleString("ru");
      const hashPassword = bcrypt.hashSync(enteredData.password, 7);
      const createUser = await users.insertOne({
        loginUser: enteredData.login,
        password: hashPassword,
        regDate: ruDate,
        status: "User",
      });
      jwt.sign(
        { userId: createUser.insertedId, userLogin: enteredData.login },
        secretKey,
        (err, token) => {
          if (err) console.log(err);
          res.cookie("token", token).status(200).json({
            id: createUser.insertedId,
            message: "Пользователь успешно зарегистрирован",
          });
        }
      );
    }
  } catch (err) {
    res.status(400).json({ message: "Ошибка при регистрации" });
  }
}

module.exports = {
  registerUser,
};
