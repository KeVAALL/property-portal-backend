// import express from 'express';
// import cors from "cors";
// import session from 'express-session';
// import cookieParser from 'cookie-parser'
// import bodyParser from 'body-parser'
// import dotenv from "dotenv";
// import MySQLStore from "express-mysql-session";

// import AuthenticationRouter from './Routes/AuthenticationRouter.js';

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const AuthenticationRouter = require("./Routes/AuthenticationRouter.js");
const BrokerRouter = require("./Routes/BrokerRouter.js");
const UserRouter = require("./Routes/UserRouter.js");
const ProjectRouter = require("./Routes/ProjectRouter.js");
const path = require("path");

const dotenv = require("dotenv");
const MySQLStore = require("express-mysql-session")(session);

dotenv.config();

const app = express();

app.use(express.static("public"));
// app.use("/Testimonial", express.static(__dirname + "/Testimonial/"));
app.use("/Uploads", express.static(__dirname + "/Uploads/"));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    imit: "300mb",
    extended: true,
    parameterLimit: 5000000,
  })
);
app.use(bodyParser.json({ limit: "300mb" }));

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions_store",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
  cookie: {
    // domain: "nodeclient.rabs.support",
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
  },
};

const sessionStore = new MySQLStore(options);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3001",
    ],
    method: ["GET", "POST"],
    credentials: true,
  })
);

app.use(
  session({
    key: process.env.SESS_NAME,
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false,
    },
  })
);

sessionStore
  .onReady()
  .then(() => {
    // MySQL session store ready for use.
    console.log("MySQLStore ready");
  })
  .catch((error) => {
    // Something went wrong.
    console.error(error);
  });

app.use(express.json());

app.use(AuthenticationRouter);
app.use("/broker", BrokerRouter);
app.use("/users", UserRouter);
app.use("/projects", ProjectRouter);

app.get("/loginCheck", (req, res) => {
  console.log(req.session);
  sessionStore.get(req.session.id, (err, sessionData) => {
    if (err || !sessionData) {
      res.send("Session not found");
    } else {
      res.send("Session found");
    }
  });
});

app.use((req, res) => {
  res.status(404).send("<h1>Opps! Bad Request</h1>");
});

app.listen(3002, () => {
  console.log("Server Running");
});
