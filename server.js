const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const { validationResult } = require("express-validator");
const { connection } = require("./commands/connection");
const { getUsers } = require("./commands/getUsers");
const { registerUser } = require("./commands/registerUser");
const { regValidation } = require("./middleware/regValidation");
const { loginUser } = require("./commands/loginUser");
const { getProfile } = require("./commands/getProfile");
const { searchUser } = require("./commands/searchUser");
const { secretKey } = require("./config");
const { addMessage } = require("./commands/addMessage");
const { getChatHistory } = require("./commands/getChatHistory");
const { ObjectId } = require("mongodb");

const server = express();

server.use(express.json());
server.use(cookieParser());

const testServer = server.listen(5007);
const wss = new WebSocket.Server({ server: testServer });

connection({ server });

server.get("/getUsers", (req, res) => {
  getUsers({ res });
});

server.post("/register", regValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
  } else {
    const enteredData = req.body;

    registerUser({ enteredData, res });
  }
});

server.post("/login", (req, res) => {
  const enteredData = req.body;

  loginUser({ enteredData, res });
});

server.get("/profile", (req, res) => {
  const { token } = req.cookies;
  getProfile({ token, res });
});

server.get("/searchUser", (req, res) => {
  const { searchValue } = req.query;
  searchUser({ searchValue, res });
});

server.get("/history", (req, res) => {
  const selectChat = req.query.selectChatId;
  const { token } = req.cookies;

  getChatHistory({ res, selectChat, token });
});

wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCookie = cookies
      .split(";")
      .find((str) => str.startsWith(" token="));
    if (tokenCookie !== undefined) {
      const token = tokenCookie.split("=")[1];
      if (token) {
        jwt.verify(token, secretKey, (err, userData) => {
          if (err) throw err;
          const { userId, userLogin } = userData;

          connection.userId = userId;
          connection.userLogin = userLogin;
        });
      }
    }
  }

  const usersOnline = [];

  [...wss.clients].map((client) => {
    usersOnline.push(client.userId);
  });

  let uniqueUsersOnline = usersOnline.reduce((a, c) => {
    if (!a.includes(c)) {
      a.push(c);
    }
    return a;
  }, []);

  console.log(uniqueUsersOnline);

  connection.on("message", (message) => {
    const parseMessage = JSON.parse(message);
    const messageObject = {
      ...parseMessage.message,
      sender: connection.userId,
    };
    if (parseMessage) {
      addMessage({ messageObject });
      wss.clients.forEach((client) => {
        if (
          client.userId === parseMessage.message.recipient ||
          client.userId === parseMessage.message.sender
        ) {
          client.send(
            JSON.stringify({
              message: { ...parseMessage.message, sender: connection.userId },
            })
          );
        }
      });
    }
  });
  connection.on("open", () => {
    uniqueUsersOnline.filter((item) => item !== connection.userId);

    wss.clients.forEach((client) => {
      client.send("Hi");
    });
  });
  connection.on("close", () => {
    uniqueUsersOnline.filter((item) => item !== connection.userId);
  });
});
