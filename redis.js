const { error } =  require("console");
const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: '',
    token: '',
})

module.exports = {redis}