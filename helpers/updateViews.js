const { base } = require("../deta");

const updateViews = async (key) => {
    try {
        const data = await base.get(key);
        if (data.content) await base.put({ ...data, views: parseInt(data.views) + 1 });
    } catch (error) {
        console.log("error in updateViews");
    }
}

module.exports = updateViews;
