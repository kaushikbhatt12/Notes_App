const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');



const JWT_SECRET = 'kaushik';



//ROUTE 1: create a User using : POST "/api/auth/createuser" .No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),                // using express validator to check for if details are valid
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {



    let success = false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }



    //check whether the user with this email exists already 
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "sorry a user with this email already exists" })
        }


        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);



        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })


        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        // console.log(jwtData);



        success = true;
        res.json({ success, authtoken });


    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occurred");
    }
})




//ROUTE 2 : authenticate the user using : POST "/api/auth/login" .No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    let success = false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "please enter correct credentials" });
        }


        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "please enter correct credentials" });
        }



        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message)
        res.status(500).send("some internal error occurred");
    }

})


// ROUTE 3 : Get logged in user details using : POST "/api/auth/getuser" .login required
router.post('/getuser', fetchuser, async (req, res) => {    // middleware is a function  which will be called whenever there is a request on routes which require login
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")   //select all fields except password
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("some internal error occurred");
    }
})


module.exports = router