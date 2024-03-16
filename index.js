require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { join } = require("path");
const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const imageRouter = require("./routes/image");
const categoryRouter = require("./routes/category");

///////////////////////////////////////////////////////////////////////////////////////////////////

app.use("/api/auth", authRouter);
app.use("/api/image", imageRouter);
app.use("/api/category", categoryRouter);
app.use("/api/img/", express.static(__dirname + "/public"));

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(
      `Server is Running on${" "}${
        process.env.NODE_ENV === "production" ? "Production" : "Development"
      } Environment`
    );
  }
});

app.get("/api", (req, res) => {
  res.send(
    `${req.protocol}://${req.hostname}:${PORT}/api is Running on${" "}${
      process.env.NODE_ENV === "production" ? "Production" : "Development"
    } Environment`
  );
});

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found!");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

//#endregion

//#region CLIENT
const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, clientPath, "index.html"));
});

//#endregion
