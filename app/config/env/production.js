module.exports = {
    dbUrl : process.env.DB_URL,
    sessionSecret : "heregoessecret",
    illegalUsernames: ['user','admin','users','admins'],
    PORT: process.env.PORT || 3000,
    HOST: process.env.NODE_HOST || 'localhost'
}
