require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(cors("*"));

app.use("/", require("./routes/api.js"));

app.get("*", ({ res }) => {
    res.status(404).json({ message: "not found" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`api server started`);
});
