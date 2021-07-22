import CONFIG from '../config'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(CONFIG.tablename, (table) => {
    table.increments('id').primary()
    table.string('nazev', 512).notNullable()
    table.string('popis', 2048)
    table.float('cena')
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(CONFIG.tablename)
}