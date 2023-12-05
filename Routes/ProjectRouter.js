const express = require("express");
const pool = require("../Database.js");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const ProjectRouter = express.Router();
let base64Image = (url, name, id, type) => {
  const Image64 = url.split(";base64,").pop();
  if (fs.existsSync("Uploads")) {
    if (fs.existsSync("Uploads/" + id)) {
      if (type === "multiple") {
        fs.mkdirSync("Uploads/" + id + "/gallery", { recursive: true });

        fs.writeFileSync(
          path.join("Uploads/" + id + "/gallery/" + name),
          Image64,
          { encoding: "base64" },
          function (err) {
            console.log(err);
          }
        );
      }
      if (type === "single") {
        fs.writeFileSync(
          path.join("Uploads/" + id + "/" + name),
          Image64,
          { encoding: "base64" },
          function (err) {
            console.log(err);
          }
        );
      }

      return;
    }
    fs.mkdirSync("Uploads/" + id, { recursive: true });
    fs.writeFileSync(
      path.join("Uploads/" + id + "/" + name),
      Image64,
      { encoding: "base64" },
      function (err) {
        console.log(err);
      }
    );
  }
};

ProjectRouter.post("/all-project", async function (req, res) {
  console.log("hi");
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query("SELECT * from projects", (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
      connection.release();
    });
  });
});
ProjectRouter.post("/project/:projectId", async function (req, res) {
  const id = req.params.projectId;

  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "SELECT * from projects WHERE prjid = ?",
      [id],
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

ProjectRouter.delete("/delete-project/:id", async function (req, res) {
  const id = req.params.id;
  console.log(id);

  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "DELETE FROM projects WHERE prjid = ?",
      [id],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          res.send(result);
        }
        connection.release();
      }
    );
  });
});

ProjectRouter.post("/add-project", async function (req, res) {
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const array = req.body.urlSelectedFiles.map((file) => {
    return file.name;
  });
  console.log(array);
  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      "INSERT INTO projects(??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        "posted_dt",
        "updated_dt",
        "prj_name",
        "prj_banner",
        "prj_type",
        "prj_category",
        "availability",
        "prj_area",
        "prj_rera",
        "area_from",
        "area_to",
        "price_from",
        "price_to",
        "prj_config",
        "prj_description",
        "towers",
        "gallery",
        "state",
        "city",
        "address",
        formattedDate,
        formattedDate,
        req.body.projectName,
        req.body.imagePreview.name,
        req.body.projectType,
        req.body.projectCategory,
        req.body.availability,
        `${req.body.projectArea} Acres`,
        req.body.projectRERA,
        req.body.areaFrom,
        req.body.areaTo,
        req.body.priceFrom,
        req.body.priceTo,
        `${req.body.projectConfiguration} BHK`,
        req.body.description,
        req.body.towers,
        array.toString(),
        req.body.state,
        req.body.city,
        req.body.address,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);

          base64Image(
            req.body.imagePreview.url,
            req.body.imagePreview.name,
            result.insertId,
            "single"
          );
          req.body.urlSelectedFiles.map((file) => {
            base64Image(file.url, file.name, result.insertId, "multiple");
          });
        }
        connection.release();
      }
    );
  });
});
ProjectRouter.post("/update-project/:id", async function (req, res) {
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const id = req.params.id;
  const gallery = req.body.gallery;
  const galleryNewFiles = req.body.urlSelectedFiles;
  const galleryRemovedFiles = req.body.removedFiles;

  let filteredGallery = gallery;
  if (galleryRemovedFiles !== undefined) {
    filteredGallery = filteredGallery.filter((item) => {
      // Define a condition to filter out elements that match galleryRemovedFiles
      return !galleryRemovedFiles.includes(item);
    });
  }
  // Step 2: Add elements from galleryNewFiles to the filteredGallery
  if (galleryNewFiles.length > 0) {
    galleryNewFiles.map((file) => {
      filteredGallery = [...filteredGallery, file.name];
    });
  }

  console.log("Gallery:" + filteredGallery.join(","));

  pool.getConnection(function (error, connection) {
    if (error) throw error;
    connection.query(
      `UPDATE projects SET updated_dt=?, prj_name=?, prj_type=?, prj_category=?, availability=?, prj_area=?, prj_rera=?, area_from=?, area_to=?, price_from=?, price_to=?, prj_config=?, prj_description=?, towers=?, state=?, city=?, address=? WHERE prjid=${id}`,
      [
        formattedDate,
        req.body.projectName,
        req.body.projectType,
        req.body.projectCategory,
        req.body.availability,
        `${req.body.projectArea} Acres`,
        req.body.projectRERA,
        req.body.areaFrom,
        req.body.areaTo,
        req.body.priceFrom,
        req.body.priceTo,
        `${req.body.projectConfiguration} BHK`,
        req.body.description,
        req.body.towers,
        req.body.state,
        req.body.city,
        req.body.address,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          if (req.body.imagePreview) {
            fs.readdir("Uploads/" + id, (err, files) => {
              if (err) {
                console.error(err);
                return;
              }
              const bannerImage = files[files.length - 1];
              fs.unlink("Uploads/" + id + "/" + bannerImage, (err) => {
                if (err) {
                  console.error(`Error deleting the file: ${err}`);
                } else {
                  console.log("File deleted successfully");
                }
              });
              base64Image(
                req.body.imagePreview.url,
                req.body.imagePreview.name,
                id,
                "single"
              );
              connection.query(
                `UPDATE projects SET prj_banner=? WHERE prjid=${id}`,
                [req.body.imagePreview.name],
                (err, result) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(result);
                  }
                }
              );
            });
          }
          if (req.body.removedFiles?.length > 0) {
            req.body.removedFiles.map((file, i) => {
              fs.unlink("Uploads/" + id + "/gallery/" + file, (err) => {
                if (err) {
                  console.error(`Error deleting the file: ${err}`);
                } else {
                  console.log("Gallery File deleted successfully");
                }
              });
            });
          }
          if (req.body.urlSelectedFiles?.length > 0) {
            req.body.urlSelectedFiles.map((file) => {
              base64Image(file.url, file.name, id, "multiple");
            });
          }
          if (filteredGallery.length > 0) {
            connection.query(
              `UPDATE projects SET gallery=? WHERE prjid=${id}`,
              [filteredGallery.join(",")],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(result);
                }
              }
            );
          }
        }

        connection.release();
      }
    );
  });
});

module.exports = ProjectRouter;

// const multer = require("multer");
// const { uploadImage } = require("../Utils.js");
