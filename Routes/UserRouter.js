// for ES5
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../Database.js");
const fs = require("fs");
const path = require("path");

let base64Image = (url, name, id) => {
  const Image64 = url.split(";base64,").pop();
  if (fs.existsSync("Uploads/Testimonial")) {
    fs.mkdirSync("Uploads/Testimonial/" + id, { recursive: true });
    fs.writeFileSync(
      path.join("Uploads/Testimonial/" + id + "/" + name),
      Image64,
      { encoding: "base64" },
      function (err) {
        console.log(err);
      }
    );
  }
};

const UserRouter = express.Router();

UserRouter.post("/add-user", async function (req, res) {
  console.log(req.body);
  const saltRounds = 10;
  const EncryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
  const sql =
    "INSERT INTO users (`username`, `roles`, `password`, `refreshToken`) VALUES (?)";
  const values = [req.body.username, "", EncryptedPassword, ""];
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Added Successfully");
      }
      connection.release();
    });
  });
});

UserRouter.post("/all-sm-users", async function (req, res) {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT u_id FROM crm_user WHERE ?? = ?",
      ["urole", req.body.urole],
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

UserRouter.post("/add-testimonial", async function (req, res) {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "INSERT INTO testimonials(??, ??, ??, ??, ??, ??) VALUES(?,?,?,?,?,?)",
      [
        "client_name",
        "role",
        "company",
        "photo",
        "rating",
        "description",
        req.body.clientName,
        req.body.role,
        req.body.company,
        req.body.imagePreview.name,
        req.body.ratings,
        req.body.description,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);

          base64Image(
            req.body.imagePreview.url,
            req.body.imagePreview.name,
            result.insertId
          );
        }
        connection.release();
      }
    );
  });
});

UserRouter.post("/all-testimonial", async function (req, res) {
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query("SELECT * FROM testimonials", (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
      connection.release();
    });
  });
});

// for ES5
module.exports = UserRouter;

// for ES6
// export default UserRouter;
