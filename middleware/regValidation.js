const { body } = require("express-validator");

const regValidation = [
  body("login")
    .escape()
    .isLength({ min: 3 })
    .withMessage(`Логин пользователя не может быть меньше 3 символов`)
    .isLength({ max: 8 })
    .withMessage("Логин пользователя не может быть больше 8 символов"),
  body("password")
    .escape()
    .isLength({ min: 5 })
    .withMessage(`Пароль пользователя не может быть меньше 5 символов`)
    .isLength({ max: 20 })
    .withMessage("Думаю 20 символов будет достаточно"),
];

module.exports = {
  regValidation,
};
