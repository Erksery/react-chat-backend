const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { secretKey } = require("../config");

async function loginUser({ enteredData, res }) {
  try {
    const condidate = await users.findOne({ loginUser: enteredData.login });
    if (condidate) {
      const checkPassword = bcrypt.compareSync(
        enteredData.password,
        condidate.password
      );
      if (checkPassword) {
        jwt.sign(
          { userId: condidate._id, userLogin: condidate.loginUser },
          secretKey,
          (err, token) => {
            if (err) console.log(err);
            res.cookie("token", token).status(200).json({
              id: condidate._id,
              message: "Пользователь успешно авторизован",
            });
          }
        );
      } else {
        res.status(400).json({
          error: `Неверный пароль`,
        });
      }
    } else {
      res.status(400).json({
        error: `Пользователя с именем ${enteredData.login} не существует `,
      });
    }
  } catch (err) {
    res.status(400).json({ error: "Ошибка при входе в аккаунт" });
  }
}

module.exports = {
  loginUser,
};
