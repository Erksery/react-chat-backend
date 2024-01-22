const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
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
const { Buffer } = require("node:buffer");
const { fileUpload } = require("./commands/fileUpload");

const server = express();

server.use(express.json());
server.use(cookieParser());

server.use("/uploads", express.static(__dirname + "/uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + "." + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueFileName + ext);
  },
});

const upload = multer({ storage: storage });

async function run() {
  await connection({ server });

  const testServer = server.listen(5007);
  const wss = new WebSocket.Server({ server: testServer });

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
    const { token } = req.cookies;

    searchUser({ searchValue, token, res });
  });

  server.get("/history", (req, res) => {
    const selectChat = req.query.selectChatId;
    const messagesLimit = req.query.messagesLimit;
    const { token } = req.cookies;

    getChatHistory({ res, selectChat, token, messagesLimit });
  });

  server.post("/fileUpload", upload.single("file"), (req, res) => {
    const file = req.file;

    fileUpload({ res, file });
  });

  wss.on("connection", (connection, req) => {
    const cookies = req.headers.cookie;

    if (cookies) {
      const tokenCookie = cookies
        .split("; ")
        .find((str) => str.startsWith("token="));
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

    connection.on("message", (message) => {
      const parseMessage = JSON.parse(message);

      const messageObject = {
        ...parseMessage.message,
      };
      if (parseMessage) {
        if ("message" in parseMessage) {
          try {
            addMessage({ messageObject });
            wss.clients.forEach((client) => {
              if (
                client.userId === parseMessage.message.recipient ||
                client.userId === parseMessage.message.sender
              ) {
                client.send(
                  JSON.stringify({
                    message: { ...parseMessage.message },
                  })
                );
              }
            });
          } catch (err) {
            console.log(err);
          }
        } else if ("file" in parseMessage) {
          const { fileData } = parseMessage.file;
          const parts = fileData.nameFile.split(".");
          const ext = parts[parts.length - 1];
          const filename = Date.now() + "." + ext;
          const path = __dirname + "/uploads/" + filename;
          const bufferData = Buffer.from(fileData.data, "utf8");
          fs.writeFile(path, bufferData, () => {
            console.log("Save");
          });
        }
      }
    });

    const usersOnline = [];

    [...wss.clients].map((client) => {
      if (client.userId !== null && client.userId !== undefined)
        usersOnline.push(client.userId);
    });

    let uniqueUsersOnline = usersOnline.reduce((a, c) => {
      if (!a.includes(c)) {
        a.push(c);
      }
      return a;
    }, []);

    function sendOnlineUsers(users) {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ onlineUsers: users }));
      });
    }

    sendOnlineUsers(uniqueUsersOnline);

    connection.on("close", () => {
      if (connection.userId ?? "Not authorization")
        console.log("Connection closed: ", connection.userId);
      const online = uniqueUsersOnline.filter(
        (item) => item !== connection.userId
      );

      sendOnlineUsers(online);
    });
  });
}

run().catch((err) => {
  console.log(err);
});
