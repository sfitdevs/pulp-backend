const express = require("express");
const { v4: uuid } = require("uuid");
const expressfu = require("express-fileupload");
const { drive } = require("../../deta");
const router = express.Router();

router.use(expressfu({
    limits: {
        fileSize: 2 * 1024 * 1024, // maximum 2 MB limit per file uploading
        files: 1 // one file at a time
    }
}));

router.post("/", async (req, res) => {
    try {
        let { file } = req.files;
        let id = await drive.put(uuid(), { data: file.data });
        res.status(200).json({ id });
    } catch (error) {
        res.status(500).json({ message: "couldn't upload file" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.status(400).json({ message: "please specify image id" });
        let image = await drive.get(id);
        if (!image) return res.set("content-type", "text/plain").status(404).json({ message: "image not found" });
        let buffer = await image.arrayBuffer();
        res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ message: "couldn't get file" });
    }
});

module.exports = router;
