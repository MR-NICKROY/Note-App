const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Notes = require("../models/note.model");
const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  try {
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists 🤨" });
    }

    const user = new User({ fullName, email, password });

    const accessToken = jwt.sign({ user: user }, process.env.TOKEN, {
      expiresIn: "30d",
    });
    await user.save();
    return res.json({
      error: false,
      user,
      accessToken,
      message: "Registration Successfully 🫡",
    });
  } catch (error) {
    res.status(404).json({ error: true, message: "Registration Failure 🤔" });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const userInfo = await User.findOne({ email });
    if (!userInfo) {
      return res.status(400).json({ message: "User not found 😮" });
    }

    const accessToken = jwt.sign({ user: userInfo }, process.env.TOKEN, {
      expiresIn: "30d",
    });

    return res.json({
      error: false,
      accessToken,
      email,
      user: userInfo,
      message: "Login Successfully 🫡",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
const note = async (req, res) => {
  const { title, content, tags } = req.body;
  const user = req.user;

  // Check if req.user exists to avoid potential runtime errors
  if (!user) {
    return res
      .status(401)
      .json({ error: true, message: "User not authenticated" });
  }

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const notes = new Notes({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await notes.save();
    return res.json({
      error: false,
      notes,
      message: "Note added successfully 🫡",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong 😮",
      err: error, // Including error message for easier debugging
    });
  }
};
const edit = async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  const { title, content, tags, isPinned } = req.body;
  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided🤨" });
  }
  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found😮" });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;
    await note.save();
    return res.json({ error: false, message: "Note updated successfully🫡" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong😮" });
  }
};
const getAll = async (req, res) => {
  const user = req.user;
  try {
    const notes = await Notes.find({ userId: user._id }).sort({
      isPinned: -1,
    });
    return res.json({
      error: false,
      notes,
      meaasge: "All notes received successfully🫡",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong😮" });
  }
};
const deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;
  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found😮" });
    }
    await Notes.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully🫡" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong😮" });
  }
};
const pinned = async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  const { isPinned } = req.body;

  try {
    const note = await Notes.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found😮" });
    }

    note.isPinned = isPinned || false;
    await note.save();
    return res.json({ error: false, message: "Pinned🫡" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong😮" });
  }
};
const getUser = async (req, res) => {
  const user = req.user;
  const IsUser = await User.findOne({ _id: user._id });
  if (!IsUser) {
    return res.status(401);
  }
  return res.json({ user: IsUser, message: "" });
};
const searchTitle = async (req, res) => {
  const { query } = req.query;

  const user = req.user;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query required" });
  }
  try {
    const matchingSearch = await Notes.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    return res.json({
      error: false,
      notes: matchingSearch,
      message: "Searched successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};
module.exports = {
  login,
  signUp,
  note,
  edit,
  getAll,
  deleteNote,
  pinned,
  getUser,
  searchTitle,
};
