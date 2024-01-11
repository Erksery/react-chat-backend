async function getUsers({ res }) {
  try {
    const usersData = await users.find().toArray();
    res.status(200).json(usersData);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getUsers,
};
