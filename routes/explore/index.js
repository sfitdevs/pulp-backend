const express = require("express");
const { base } = require("../../deta");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        let response = await base.fetch({});
        let pulps = response.items;

        while (response.last) {
            response = await base.fetch({}, { last: response.last });
            pulps = pulps.concat(response.items);
        }

        let explorePulps = pulps.map(({ key, language, timestamp, title, views, password }) => {
            if (!password) {
                return { key, language, timestamp, title, views }
            }
        })

        res.status(200).json(explorePulps.filter((pulp) => pulp));
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = router;
