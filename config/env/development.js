const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000;

module.exports = {
    host: HOST,
    port: PORT,
    db: process.env.MONGODB_URI,
    steam: {
        key: process.env.STEAM_API_KEY,
        returnURL: `http://${HOST}:${PORT}/auth/steam/return`,
        realm: `http://${HOST}:${PORT}`
    }
};