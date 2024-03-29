const express = require("express");
const shortUniqueId = require("short-unique-id");
const { collection } = require("../../deta");

const router = express.Router();

const keyGenerator = new shortUniqueId.default({ dictionary: "alpha_lower", length: 5 });
const accessKeyGenerator = new shortUniqueId.default({ dictionary: "hex", length: 10 });

router.get("/:key", async (req, res) => {
    try {
        let { key } = req.params;
        if (!key) return res.status(400).json({ message: "key not specified" });
        let collectionData = await collection.get(key)
        if (collectionData) {
            return res.status(200).json((({ password, accessKey, ...data }) => data)(collectionData));
        } else {
            return res.status(404).json({ message: "collection not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

router.post("/", async ({ body }, res) => {
    try {
        if (body.pulps.length == 0) return res.status(400).json({ message: "collection can't be empty" });
        let details = await collection.put({
            pulps: body.pulps,
            title: body.title || "",
            password: body.password || "",
            key: keyGenerator.randomUUID(),
            accessKey: accessKeyGenerator.randomUUID(),
            timestamp: Date.now(),
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
        let { items, count } = await collection.fetch({ accessKey });
        if (count) {
            await collection.delete(items[0].key);
            res.status(200).json({ message: "collection deleted successfully" });
        } else {
            res.status(404).json({ message: "collection not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = router;
