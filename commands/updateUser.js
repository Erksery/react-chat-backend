async function updateUser({ userId }) {
  try {
    await users.updateOne(
      { userId: userId },
      { $set: { onlineStatus: "online" } }
    );
    console.log("Данные обновленны");
  } catch (err) {
    console.log("Ошибка при обновлении данных");
  }
}

module.exports = {
  updateUser,
};
