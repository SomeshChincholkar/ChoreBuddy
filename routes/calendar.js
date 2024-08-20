const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const Group = require("../models/group");

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

router.use(isLoggedIn);

// Calendar route
router.get("/", async (req, res) => {
    const userId = req.session.userId;
    const userGroups = await Group.find({ members: userId });

    let tasks;

    if (userGroups.length > 0) {
        // User is in at least one group
        const groupIds = userGroups.map(group => group._id);
        tasks = await Task.find({ groupId: { $in: groupIds } });
    } else {
        // User is not in any group
        tasks = await Task.find({ assignedTo: userId });
    }

    res.render("calendar.ejs", { tasks });
});

module.exports = router;
