const express = require("express");
const router = express.Router();

// router to handle image operations
router.use("/image", require("./images"));

// router to handle pulp operations
router.use("/pulp", require("./pulp"));

// router to handle explore section
router.use("/explore", require("./explore"));

// router to handle collection section
router.use("/collection", require("./collection"));

// router to handle emails
router.use("/mail", require("./mail"));

module.exports = router;
