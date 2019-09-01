const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create user schema (will be used later for registering accounts)
const gameSchema = new Schema({
    _id: Number,
    name: String,
    type: String,
    headerImage: String,
    description: String,
    minRequirements: String,
    recRequirements: String,
    developers: [String],
    publishers: [String],
    price: Number,
    categories: Schema.Types.Mixed,
    metacritic: Schema.Types.Mixed
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;