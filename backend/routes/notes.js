const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');

//fetchuser is a middleware which fetches login details of the user


//ROUTE 1: get all user notes using  : GET "/api/auth/fetchnotes" . login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occurred");
    }
})



//ROUTE 2: add a new note using  : POST "/api/auth/addnote" . login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),                // using express validator to check for if details are valid
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;     //destructuring

        // if there are errors return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({ title, description, tag, user: req.user.id })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occurred");
    }
})



//ROUTE 3: update an existing note using : PUT "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;   //destructuring
    try {
        //create a new object
        const newNote = {};
        if (title) { newNote.title = title };                             // add updates to new object
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        if (note.user.toString() !== req.user.id) {          //check if the user to whom note belongs and current logged in user are same 
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occurred");
    }

})




//ROUTE 4: delete an existing note using : DELETE "/api/notes/deletenote" . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        //find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        if (note.user.toString() !== req.user.id) {          //check if the user to whom note belongs and current logged in user are same 
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "success": "note has been deletd", note: note })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occurred");
    }

})


module.exports = router