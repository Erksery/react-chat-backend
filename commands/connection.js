const { MongoClient } = require("mongodb");

const client = new MongoClient(
  "mongodb+srv://vitalymoshk:GJuaDASgdiskNtKQ@cluster0.nlbwmlr.mongodb.net/"
);

async function connection({ server }) {
  try {
    const database = client.db("ReactChatApi");
    global.users = database.collection("usersDatabase");
    global.messages = database.collection("messagesDatabase");
    await client.connect();
  } catch (err) {
    console.log("Ошибка при подключении к базе данных");
  } finally {
    console.log("http://localhost:5007");
  }
}

module.exports = {
  connection,
};
