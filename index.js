require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
mongoose.connect(config.Mongoose);
const {
  login,
  signUp,
  note,
  edit,
  getAll,
  deleteNote,
  pinned,
  getUser,
  searchTitle,
} = require("./request/links");
const express = require("express");
const cors = require("cors");

const { authToken } = require("./utilities");
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
// signUp
app.post("/signup", signUp);
// Login
app.post("/login", login);
// ADD-NOTES
app.post("/add", authToken, note);
// EDIT-NOTES
app.put("/edit/:noteId", authToken, edit);
// get-all-note
app.get("/get-all", authToken, getAll);
// delete-note
app.delete("/delete/:noteId", authToken, deleteNote);
// Pinned-note
app.put("/pinned/:noteId", authToken, pinned);
// getAllUser
app.get("/get-user/", authToken, getUser);
// searchAPI
app.get("/search", authToken, searchTitle);
app.listen(8080, () => {
  console.log("listening on 8080");
});
module.exports = app;
