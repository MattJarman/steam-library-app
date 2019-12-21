const UserModel = require('../models/user');

const HTTP_OK = 200;
const HTTP_ERROR = 400;

const GENERIC_ERROR_MSG = 'There was an unexpected error.';

class User {

    constructor(id) {
        this.id = id;
    }

    /**
     * Retrieves all games from a selected category
     * @param {String} from | Name of array you want returned
     */
    async getApps(from) {
        let apps = [];

        try {
            apps = await UserModel
                .findById(this.id)
                .populate(`${from}`)
                .then(result => {
                    return result[from];
                });
        } catch (error) {
            return {
                payload: apps,
                status: HTTP_ERROR,
                success: false,
                message: [
                    GENERIC_ERROR_MSG,
                    error
                ],
            };
        }
        
        return {
            payload: apps,
            status: HTTP_OK,
            success: true,
            message: ['Apps have been successfully retrieved from the database.'],
        };
    }

    /**
     * Adds games to a user's backlog
     * @param {Array} toInsert | Games to insert into backlog
     */
    async addGamesToBacklog(toInsert) {
        let query = { _id: this.id };
        let update = { $addToSet: { 'backlog': { $each: toInsert } } };

        try {
            await UserModel.findOneAndUpdate(query, update, { upsert: true}).exec();
        } catch (error) {
            return {
                payload: toInsert,
                status: HTTP_ERROR,
                success: false,
                message: [
                    GENERIC_ERROR_MSG,
                    error
                ],
            };
        }

        return {
            payload: toInsert,
            status: HTTP_OK,
            success: true,
            message: [`Apps successfully added to backlog.`],
        };
    }

    /**
     * Deletes games from a user's profile
     * @param {Object} toDelete | Games to be deleted with information 
     *                          | about there current whereabouts
     */
    async deleteGames(toDelete) {
        let query = { _id: this.id };

        for (let key in toDelete) {
            let update = { $pull: { [`${key}`]: { $in: toDelete[key] } } };

            try {
                await UserModel.findOneAndUpdate(query, update, { upsert: true }).exec();
            } catch (error) {
                return {
                    payload: toDelete,
                    status: HTTP_ERROR,
                    success: false,
                    message: [
                        GENERIC_ERROR_MSG,
                        error
                    ],
                };
            }
        }

        return {
            payload: toDelete,
            status: HTTP_OK,
            success: true,
            message: [`All apps were successfully deleted.`],
        };
    }

    /**
     * 
     * @param {String} from | Where the game currently exists
     * @param {String} to   | Where the game is being moved to
     * @param {Number} game | The App ID of the game
     */
    async moveGame({ from, to, game }) {
        let query = { _id: this.id };
        let removeUpdate = { $pull: { [`${from}`]: { $in: game } } };

        let addUpdate = { $addToSet: { [`${to}`]: game } };

        try {
            await UserModel.findOneAndUpdate(query, removeUpdate, { upsert: true }).exec();
            await UserModel.findOneAndUpdate(query, addUpdate, { upsert: true }).exec();
        } catch (error) {
            return {
                payload: {
                    from: from,
                    to: to,
                    game: game,
                },
                status: HTTP_ERROR,
                success: false,
                message: [
                    GENERIC_ERROR_MSG,
                    error
                ],
            };
        }

        return {
            payload: {
                from: from,
                to: to,
                game: game,
            },
            status: HTTP_OK,
            success: true,
            message: [`App ${game} was successfully moved from ${from} to ${to}.`],
        };
    }
}

module.exports = User;