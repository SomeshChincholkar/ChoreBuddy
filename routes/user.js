const express = require("express")
const router = express.Router()
const User = require("../models/user.js")

router.get("/register", async (req, res)=>{
    res.render("./users/register.ejs")
})

router.post("/register", async (req, res)=>{
    
    const { email, username, password } = req.body;

    const user = new User({ email, username, password });
    await user.save();

    req.session.userId = user._id;   // Store user ID in session
    res.redirect("/tasks");
})

router.get("/login", (req, res)=>{
    res.render("./users/login.ejs")
})

router.post("/login", async (req, res)=> {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, password });
    if (user) {
        req.session.userId = user._id;   // Store user ID in session
        res.redirect("/tasks");
    } else {
        res.redirect("/login");
    }    
})

router.get("/logout", (req, res) => {
    req.session.destroy(); // Destroy the session to log out the user
    res.redirect("/login"); // Redirect to login page
});

module.exports = router