import assert from 'assert'
const chai = require('chai')
chai.should()
var streams = require('memory-streams')
// import _ from 'underscore'

module.exports = (g) => {
  const r = chai.request(g.baseurl)
  const p1 = {
    nazev: 'app',
    popis: 'p1',
    cena: 100
  }

  return describe('posts', () => {

    it('shall return total items when paginated', async () => {
      for (let i = 0; i < 10; i++) {
        const data = Object.assign(p1, {nazev: i})
        await g.EntityMW.create(data)
      }
      const q = { currentPage: 2, perPage: 2, sort: 'id:asc' }
      const res = await g.EntityMW.list(q)
      res.pagination.total.should.equal(11)
    })

  })
}