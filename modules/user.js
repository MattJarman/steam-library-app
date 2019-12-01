const UserModel = require('../models/user');

const HTTP_OK = 200;

class User {

    constructor(id) {
        this.id = id;
    }

    getBacklog() {
        return new Promise(resolve => {
            UserModel.findById(this.id)
            .populate('backlog')
            .exec((err, user) => {
                if(err) console.error(err);

                let backlog = (typeof user.backlog !== undefined)
                    ? user.backlog
                    : [];

                resolve(backlog);
            });
        });
    }

    addGamesToBacklog(toInsert) {
        let games = Array.isArray(toInsert) 
            ? toInsert
            : [toInsert];

        
        let query = { _id: this.id };
        let update = { $addToSet: { 'backlog': { $each: games } } };

        return new Promise(resolve => {
            UserModel.findOneAndUpdate(query, update, { upsert: true })
            .exec((err, user) => {
                if(err) console.log(err);

                resolve(user);
            });
        });
    }

    deleteGamesFromBacklog(toDelete) {
        let query = { _id: this.id };
        let update = { $pull: { 'backlog': { $in: toDelete } } }

        return new Promise(resolve => {
            UserModel.findOneAndUpdate(query, update, { upsert: true })
            .exec((err, user) => {
                if(err) console.log(err);
                
                resolve({
                    'payload': toDelete,
                    'status': HTTP_OK,
                    'message': 'Games successfully deleted.'
                });
            });
        });
    }
}

module.exports = User;