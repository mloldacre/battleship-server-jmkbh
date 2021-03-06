const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected Endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray()
  const [testUser] = testUsers
  const testStats = helpers.makeStatsArray(testUser)

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  beforeEach('insert users and game stats', () => {
    return helpers.seedUsersStats(
      db,
      testUsers,
      testStats,
    )
  })

  const protectedEndpoints = [
    {
      name: 'GET /api/stats',
      path: '/api/stats',
      method: supertest(app).get,
    },
    {
      name: 'PUT /api/auth/token',
      path: '/api/auth/token',
      method: supertest(app).put,
    },
    {
      name: 'POST /api/stats',
      path: '/api/stats',
      method: supertest(app).post
    },
    {
      name: `POST /api/game/newgame`,
      path: `/api/game/newgame`,
      method: supertest(app).post
    },
    {
      name: `POST /api/game/mp/newgame`,
      path: `/api/game/mp/newgame`,
      method: supertest(app).post
    },
    {
      name: `POST /api/game/mp/setboard/:id`,
      path: `/api/game/mp/setboard/:id`,
      method: supertest(app).patch
    },
  ]

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: `Missing bearer token` })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 }
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })
})
