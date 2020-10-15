const knex = require('knex')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  })
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */
function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      name: 'Test user 1',
      password: 'password',
    },
    {
      id: 2,
      username: 'test-user-2',
      name: 'Test user 2',
      password: 'password',
    },
  ]
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of stats
 */
function makeStatsArray(user) {
  return [
    {
      id: 1,
      game_wins: 3,
      game_losses: 1,
      games_played: 4,
      shots_hit: 18,
      shots_missed: 3,
      carrier_destroyed: 4,
      battleship_destroyed: 3,
      destroyer_destroyed: 4,
      submarine_destroyed: 3,
      patrolboat_destroyed: 3,
    }
  ]
}




/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.username,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
}



  /**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE 
        "game_stats",
        "user"`
        )
        .then(() =>
          Promise.all([
            trx.raw(`ALTER SEQUENCE game_stats_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE user_id_seq minvalue 0 START WITH 1`),
            trx.raw(`SELECT setval('game_stats_id_seq', 0)`),
            trx.raw(`SELECT setval('user_id_seq', 0)`),
          ])
        )
    )
}


/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.transaction(async trx => {
      await trx.into('user').insert(preppedUsers)
  
      await trx.raw(
        `SELECT setval('user_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    })
}


/**
 * insert stats into db and update sequence
 * @param {knex instance} db
 * @param {array} stats - array of stats objects for insertion
 * @returns {Promise} - when stats table seeded
 */
async function seedStats(db, users, stats) {
  await seedUsers(db, users)

  await db.transaction(async trx => {
    await trx.into('game_stats').insert(stats)

    await Promise.all([
      trx.raw(
        `SELECT setval('language_id_seq', ?)`,
        [stats[stats.length - 1].id],
      ),
    ])
  })
}


module.exports = {
    makeKnexInstance,
    makeUsersArray,
    makeStatsArray,
    cleanTables,
    seedUsers,
    seedStats,
    makeAuthHeader
}