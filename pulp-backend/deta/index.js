require("dotenv").config();
const { Deta } = require("deta");
const deta = Deta("d0VWxU4YRx3A_4Aeo76BPSPS9eEmvjFHKpDThNEEJ17mt");
const base = deta.Base("pulp");
const drive = deta.Drive("pulp");

module.exports = { base, drive };
