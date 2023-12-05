// for ES5
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../Database.js");

// for ES6
// import express from "express";
// import bcrypt from "bcryptjs";
// import pool from "../Database.js";

const AuthenticationRouter = express.Router();

AuthenticationRouter.post("/checkUser", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body.username);

  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT u_id,username,password FROM users WHERE ?? = ?",
      ["username", username],
      (err, result) => {
        if (err) {
          console.log("error");
        }
        if (result.length > 0) {
          bcrypt.compare(password, result[0].password, (error, response) => {
            if (response) {
              req.session.user = [
                {
                  u_id: result[0].u_id,
                  username: result[0].username,
                  // utype: result[0].utype,
                  // urole: result[0].urole,
                },
              ];
              res.send({
                status: "Login Done",
                // role: req.session.user[0].urole,
                name: req.session.user[0].username,
              });
            } else {
              res.send("Incorrect Password");
            }
            connection.release();
          });
        } else {
          res.send("User doesn't exist");
        }
      }
    );
  });
});

AuthenticationRouter.post("/change-password", async function (req, res) {
  const saltRounds = await 10;
  const EncryptedNewPassword = await bcrypt.hash(
    req.body.new_password,
    saltRounds
  );
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT password FROM crm_user WHERE ?? =?",
      ["u_id", req.session.user[0].u_id],
      (err, result) => {
        if (err) {
          console.log("error");
        }
        if (result.length > 0) {
          bcrypt.compare(
            req.body.current_password,
            result[0].password,
            (error, response) => {
              if (response) {
                pool.getConnection(function (error, connection) {
                  if (error) throw error;
                  connection.query(
                    "UPDATE `crm_user` SET ?? = ?, ?? = ? WHERE ?? =?",
                    [
                      "update_dt",
                      req.body.update_dt,
                      "password",
                      EncryptedNewPassword,
                      "u_id",
                      req.session.user[0].u_id,
                    ],
                    (err, result) => {
                      if (err) {
                        console.log("error");
                      } else {
                        res.send("Password Updated Successfully");
                      }
                      connection.release();
                    }
                  );
                });
              } else {
                res.send("Incorrect Current Password");
              }
            }
          );
        }
        connection.release();
      }
    );
  });
});

AuthenticationRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("user");
      res.redirect("/");
    }
  });
});

// for ES5
module.exports = AuthenticationRouter;

// for ES6
// export default AuthenticationRouter;
