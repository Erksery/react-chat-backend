async function searchUser({ searchValue, res }) {
  const projection = {
    _id: 1,
    loginUser: 1,
    regDate: 1,
    status: 1,
  };

  try {
    const user = await users
      .find({ loginUser: { $regex: new RegExp(searchValue, "i") } })
      .project(projection)
      .toArray();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.json({ searchResult: "Нету такого" });
  }
}

module.exports = {
  searchUser,
};
