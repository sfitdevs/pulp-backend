require("dotenv").config();
const { Deta } = require("deta");
const deta = Deta();
const base = deta.Base("pulp");
const drive = deta.Drive("pulp");

module.exports = { base, drive };
