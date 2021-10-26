const { User, Follow } = require("../models/authModel");

const getSuggestions = async (req, res, next) => {
    try {
        let currentUser = req.currentUser;
        let excludeOne = await Follow.find({
            userOne: req.currentUser._id,
            status: {
                $in: [1, 2, 3, 4],
            },
        }).distinct("userTwo");
        let excludeTwo = await Follow.find({
            userTwo: req.currentUser._id,
            status: {
                $in: [4],
            },
        }).distinct("userOne");
        let excludeUsers = [...excludeOne, ...excludeTwo];
        excludeUsers.push(currentUser._id);
        let suggestions = await User.aggregate([
            {
                $match: {
                    _id: { $nin: excludeUsers },
                },
            },
            { $sample: { size: 10 } },
            {
                $project: {
                    profile: 1,
                    userName: 1,
                },
            },
        ]);
        res.json(suggestions);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports = {
    getSuggestions,
};
