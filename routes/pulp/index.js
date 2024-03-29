const express = require("express");
const shortUniqueId = require("short-unique-id");
const { base } = require("../../deta");
const updateViews = require("../../helpers/updateViews");

const router = express.Router();

const keyGenerator = new shortUniqueId.default({ dictionary: "alpha_lower", length: 5 });
const accessKeyGenerator = new shortUniqueId.default({ dictionary: "hex", length: 10 });

router.get("/:key", async (req, res) => {
    try {
        let { key } = req.params;
        let { type, password } = req.query;
        if (!key) return res.status(400).json({ message: "key not specified" });
        let pulpData = await base.get(key);
        // no pulp found in database
        if (!pulpData) return res.status(404).json({ message: "pulp not found" });
        // pulp has password, do some checks | we can use auth headers but for now its okay, maybe future?
        if (pulpData.password) {
            // no password provided
            if (!password) return res.status(401).json({ message: "pulp is protected" });
            // user supplied a password but its not right
            if (pulpData.password != password) return res.status(401).json({ message: "password entered is wrong" });
        }
        // switch type if all above cases are satisfied
        switch (type) {
            case "raw":
                res.set("content-type", "text/plain").status(200).send(pulpData.content);
                break;
            case "download":
                res.set({ "content-type": "text/plain", "content-disposition": `attachment;filename=${pulpData.key}.${pulpData.language}` }).status(200).send(pulpData.content);
                break;
            default:
                res.status(200).json((({ password, accessKey, ...data }) => data)(pulpData));
                break;
        }
        await updateViews(key);
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

router.put("/", async (req, res) => {
    try {
        let { content, accessKey } = req.body;
        if (!content) return res.status(400).json({ message: "content can't be empty" });
        if (!accessKey) return res.status(400).json({ message: "accessKey not specified" });
        let { items, count } = await base.fetch({ accessKey });
        if (count) {
            await base.update({ content }, items[0].key);
            res.header(200).json({ message: "updated" });
        } else {
            res.status(404).json({ message: "pulp not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

router.post("/", async ({ body }, res) => {
    try {
        if (!body.content) return res.status(400).json({ message: "content can't be empty" });
        if (!Array.isArray(body.images)) return res.status(400).json({ message: "images must be an array of image ids" });
        let details = await base.put({
            content: body.content,
            title: body.title || "",
            language: body.language?.toLowerCase() || "",
            password: body.password || "", // add bcrypt hashing
            key: keyGenerator.randomUUID(),
            accessKey: accessKeyGenerator.randomUUID(),
            timestamp: Date.now(),
            images: body.images || [],
            views: 0
        });
        res.status(200).json((({ password, ...data }) => data)(details));
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

router.delete("/", async (req, res) => {
    try {
        let { accessKey } = req.body;
        if (!accessKey) return res.status(400).json({ message: "accessKey not specified" });
        let { items, count } = await base.fetch({ accessKey });
        if (count) {
            await base.delete(items[0].key);
            res.status(200).json({ message: "pulp deleted successfully" });
        } else {
            res.status(404).json({ message: "pulp not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = router;
