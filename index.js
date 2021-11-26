import { whereFilter } from 'knex-filter-loopback'
import { format as CsvStream } from 'fast-csv'
import _ from 'underscore'

export default function initEntityMiddlewarez (config, knex, ErrorClass) {

  function _getQBuilder(schema) {
    return knex(knex.ref(config.tablename).withSchema(schema))
  }

  function create (data, schema = null) {
    return _getQBuilder(schema).insert(data).returning('*').catch(err => {
      throw new ErrorClass(400, err.toString())
    })
  }

  function check_data (data) {
    const diff = _.difference(_.keys(data), config.editables)
    if (diff.length) {
      throw new ErrorClass(400, 'wrong attributes in data set: ' + diff)
    }
  }

  function get (id, schema = null) {
    const cond = { [config.idattr || 'id']: id }
    return _getQBuilder(schema).where(cond)
    .then(res => {
      if (res.length) return res[0]
      throw new ErrorClass(404, 'not found')
    })
  }

  function list (query, schema = null) {
    // if (!query.currentPage && !query.filter)
    //   throw new Error('insuficient constraints')
    return do_list(query, schema)
  }

  function do_list (query, schema = null) {
    const currentPage = Number(query.currentPage) || null
    const perPage = Number(query.perPage) || 10
    const fields = query.fields ? query.fields.split(',') : null
    const sort = query.sort ? query.sort.split(':') : null
    const filter = query.filter || null
    let qb = _getQBuilder(schema)
    qb = filter ? qb.where(whereFilter(filter)) : qb
    qb = fields ? qb.select(fields) : qb
    qb = sort ? qb.orderBy(sort[0], sort[1]) : qb
    const p = currentPage 
      ? qb.paginate({ perPage, currentPage, isLengthAware: true }) 
      : qb
    return p.catch(err => {
      throw new ErrorClass(400, err.toString())
    })
  }

  async function update (id, data, schema = null) {
    const cond = { [config.idattr || 'id']: id }
    data = _.pick(data, config.editables)
    return _getQBuilder(schema).where(cond).update(data).returning('*').catch(err => {
      throw new ErrorClass(400, err.toString())
    })
  }

  function remove (id, schema = null) {
    const cond = { [config.idattr || 'id']: id }
    return _getQBuilder(schema).where(cond).del().catch(err => {
      throw new ErrorClass(400, err.toString())
    })
  }

  function csv_export (query, outStream, schema = null) {  
    const csvStream = CsvStream({ headers: true })
    csvStream.pipe(outStream)
    return do_list(query, schema).then(found => {
      found.map(rec => {
        csvStream.write(rec)
      })    
    })
  }

  return { create, update, list, get, remove, csv_export, check_data }
}