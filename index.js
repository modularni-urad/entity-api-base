import { whereFilter } from 'knex-filter-loopback'
import { format as CsvStream } from 'fast-csv'
import _ from 'underscore'

export default { create, update, list, get, remove, csv_export, check_data }

export function create (data, config, knex) {
  return knex(config.tablename).insert(data).returning('*')
}

export function check_data (data, config) {
  const diff = _.difference(_.keys(data), config.editables)
  if (diff.length) throw new Error('wrong attributes in data set: ' + diff)
}

export function get (id, config, knex) {
  const cond = { [config.idattr || 'id']: id }
  return knex(config.tablename).where(cond).first()
}

export function list (query, config, knex) {
  // if (!query.currentPage && !query.filter)
  //   throw new Error('insuficient constraints')
  return do_list(query, config, knex)
}

function do_list (query, config, knex) {
  const currentPage = Number(query.currentPage) || null
  const perPage = Number(query.perPage) || 10
  const fields = query.fields ? query.fields.split(',') : null
  const sort = query.sort ? query.sort.split(':') : null
  const filter = query.filter || null
  let qb = knex(config.tablename)
  qb = filter ? qb.where(whereFilter(filter)) : qb
  qb = fields ? qb.select(fields) : qb
  qb = sort ? qb.orderBy(sort[0], sort[1]) : qb
  return currentPage 
    ? qb.paginate({ perPage, currentPage, isLengthAware: true }) 
    : qb
}

export async function update (id, data, config, knex) {
  const cond = { [config.idattr || 'id']: id }
  data = _.pick(data, config.editables)
  return knex(config.tablename).where(cond).update(data).returning('*')
}

export function remove (id, config, knex) {
  const cond = { [config.idattr || 'id']: id }
  return knex(config.tablename).where(cond).del()
}

export function csv_export (query, config, outStream, knex) {  
  const csvStream = CsvStream({ headers: true })
  csvStream.pipe(outStream)
  return do_list(query, config, knex).then(found => {
    found.map(rec => {
      csvStream.write(rec)
    })    
  })
}