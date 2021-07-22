import _ from 'underscore'
import { attachPaginate } from 'knex-paginate'
const Knex = require('knex')
const knexHooks = require('knex-hooks')
const path = require('path')

export default function initDB () {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true,
    migrations: {
      directory: path.resolve(__dirname, '../migrations')
    }
  }
  const knex = Knex(opts)
  knexHooks(knex)
  // knex.addHook('after', 'insert', TNAMES.FILES, (when, method, table, params) => {
  //   const data = knexHooks.helpers.getInsertData(params.query)
  //   data.id = params.result[0]
  //   params.result[0] = data
  // })
  attachPaginate()

  return knex.migrate.latest().then(() => {
    return knex
  })
}
