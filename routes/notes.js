const express = require('express');
const fetchUser = require('../middleware/getUser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// Route 1: Adding a new note using POST: http://localhost:3020/api/notes/addnote
router.post('/addnote',
  [
    body('title')
      .isLength({ min: 3 })
      .withMessage('Title must consist of at least 3 characters'),
    body('description')
      .isLength({ min: 5 })
      .withMessage('Description must have at least 5 characters'),
  ],
  fetchUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;

      const note = await Notes.create({
        user: req.user.id, // user object will be added by getUser middleware
        title: title,
        description: description,
        tag: tag
      });

      res.json({ note });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal server error occurred");
    }
  }
);

// Route 2: Get all notes using GET: http://localhost:3020/api/notes/fetchallnotes
router.get('/fetchallnotes', fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal server error occurred");
  }
});

// Route 3: Update a note using PUT: http://localhost:3020/api/notes/updatenote/:id
router.put('/updatenote/:id', 
[
  body('title')
    .isLength({ min: 3 })
    .withMessage('Title must consist of at least 3 characters'),
  body('description')
    .isLength({ min: 5 })
    .withMessage('Description must have at least 5 characters'),
], 
fetchUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const noteID = req.params.id; // this will be noteID
  try {
    const { title, description, tag } = req.body;

    // Getting entire entry of the note which user requests to update
    const noteToBeUpdated = await Notes.findById(noteID);

    // If such record / note does not exist then we cannot update it, so just return user
    if (!noteToBeUpdated) {
      return res.status(404).send("Such note is not found");
    }

    // If found, then check whether user updates his/her own note or not
    if (req.user.id !== noteToBeUpdated.user.toString()) {
      return res.status(401).send("You cannot change other's note");
    }

    // If user updates his/her own note, then do it
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    const updatedNote = await Notes.findByIdAndUpdate(noteID, { $set: newNote }, { new: true });
    res.json(updatedNote);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal server error occurred");
  }
});

// Route 4: Delete a note using DELETE: http://localhost:3020/api/notes/deletenote/:id
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
  const noteID = req.params.id; // this will be noteID
  try {
    // Getting entire entry of the note which user requests to delete
    const noteToBeDeleted= await Notes.findById(noteID);

    // If such record / note does not exist then we cannot delete it, so just return user
    if (!noteToBeDeleted) {
      return res.status(404).send("Such note is not found");
    }

    // If found, then check whether user deletes his/her own note or not
    if (req.user.id !== noteToBeDeleted.user.toString()) {
      return res.status(401).send("You cannot delete other's note");
    }

    // If user deletes his/her own note, then do it
    const deletedNote = await Notes.findByIdAndDelete(noteID);
    res.json({"Success": "Successfully deleted", deletedNote});
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal server error occurred");
  }
});

module.exports = router;
