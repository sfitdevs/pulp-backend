const express = require("express");
const router = express.Router();

// router to handle image operations
router.use("/image", require("./images"));

// router to handle pulp operations
router.use("/pulp", require("./pulp"));

// router to handle explore section
router.use("/explore", require("./explore"));

module.exports = router;
