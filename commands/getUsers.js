async function getUsers({ res }) {
  const projection = {
    _id: 1,
    loginUser: 1,
    status: 1,
    avatarColor: 1,
  };

  try {
    const usersData = await users.find().project(projection).toArray();
    res.status(200).json(usersData);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Ошибка при получении пользователей" });
  }
}

module.exports = {
  getUsers,
};
