// for ES5
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../Database.js");

// for ES6
// import express from "express";
// import bcrypt from "bcryptjs";
// import pool from "../Database.js";

const BrokerRouter = express.Router();

BrokerRouter.post("/add-broker", async function (req, res) {
  const saltRounds = await 10;
  const EncryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "INSERT INTO crm_broker(??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        "create_dt",
        "update_dt",
        "username",
        "password",
        "owner_name",
        "company_name",
        "ccode",
        "mobile",
        "email_id",
        "maharera",
        "country",
        "state",
        "city",
        "locality",
        "sub_locality",
        "sales_id",
        req.body.create_dt,
        req.body.update_dt,
        req.body.username,
        EncryptedPassword,
        req.body.owner_name,
        req.body.company_name,
        req.body.ccode,
        req.body.mobile,
        req.body.email_id,
        req.body.maharera,
        req.body.country,
        req.body.state,
        req.body.city,
        req.body.locality,
        req.body.sub_locality,
        req.body.sales_id,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Broker Added Successfully");
        }
        connection.release();
      }
    );
  });
});

BrokerRouter.post("/all-broker", (req, res) => {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT create_dt,update_dt,broker_id, company_name, owner_name, ccode, mobile,email_id,maharera,country,state,city,locality,sub_locality,sales_id FROM crm_broker",
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
        connection.release();
      }
    );
  });
});

BrokerRouter.post("/delete-single-broker", (req, res) => {
  console.log(req.body.broker_id);
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "DELETE FROM `crm_broker` WHERE ?? = ?",
      ["broker_id", req.body.broker_id],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
        connection.release();
      }
    );
  });
});

BrokerRouter.post("/get-broker-details", (req, res) => {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT * FROM `crm_broker` WHERE ?? = ?",
      ["broker_id", req.body.broker_id],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
        connection.release();
      }
    );
  });
});

BrokerRouter.post("/edit-broker", (req, res) => {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "UPDATE crm_broker SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?",
      [
        "update_dt",
        req.body.update_dt,
        "owner_name",
        req.body.owner_name,
        "company_name",
        req.body.company_name,
        "ccode",
        req.body.ccode,
        "mobile",
        req.body.mobile,
        "email_id",
        req.body.email_id,
        "maharera",
        req.body.maharera,
        "country",
        req.body.country,
        "state",
        req.body.state,
        "city",
        req.body.city,
        "locality",
        req.body.locality,
        "sub_locality",
        req.body.sub_locality,
        "sales_id",
        req.body.sales_id,
        "broker_id",
        req.body.broker_id,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Broker Edit Successfully");
        }
        connection.release();
      }
    );
  });
});

// for ES5
module.exports = BrokerRouter;

// for ES6
// export default BrokerRouter;
