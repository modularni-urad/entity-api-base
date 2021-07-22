import conf from './config'
import assert from 'assert'
const chai = require('chai')
chai.should()
var streams = require('memory-streams')
// import _ from 'underscore'

module.exports = (g) => {
  const r = chai.request(g.baseurl)
  const p1 = {
    nazev: 'app1',
    popis: 'p1',
    cena: 100
  }
  const p2 = {
    nazev: 'app2',
    popis: 'p1',
    cena: 40
  }

  return describe('posts', () => {

    it('shall pass check_data', async () => {
      assert.ok(async () => {
        g.TestedModule.check_data({ nazev: 'ahoj' }, conf)
      })
    })

    it('shall pass check_data', async () => {
      assert.ok(async () => {
        g.TestedModule.check_data(p1, conf)
      })
    })

    it('must not pass check_data', async () => {
      await assert.rejects(async () => {
        const wrongdata = Object.assign({}, p1, { ahoj: 'cau' })
        const res = await g.TestedModule.check_data(wrongdata, conf)
      })
    })

    it('shall create a new item', async () => {
      const res = await g.TestedModule.create(p1, conf, g.knex)
      // res.id.should.equal(1)
    })

    it('shall list the pok1', async () => {
      const query = {
        filter: { nazev: p1.nazev }
      }
      const res = await g.TestedModule.list(query, conf, g.knex)
      res.should.have.lengthOf(1)
      res[0].nazev.should.equal(p1.nazev)
    })

    it('shall not list with insufficient constraints', async () => {
      await assert.rejects(async () => {
        return g.TestedModule.list({}, conf, g.knex)
      })
    })

    it('shall update', async () => {
      const res = await g.TestedModule.update(1, { nazev: 'gandalf' }, conf, g.knex)
      // res.id.should.equal(1)
    })

    it('shall get the pok1 with pagination', async () => {
      const q = { currentPage: 1, perPage: 10, sort: 'id:asc' }
      const res = await g.TestedModule.list(q, conf, g.knex)
      res.pagination.total.should.equal(1)
      res.data.should.have.lengthOf(1)
      res.data[0].nazev.should.equal('gandalf')
    })

    it('shall get export', async () => {
      await g.TestedModule.create(p2, conf, g.knex)  
      var destStream = new streams.WritableStream()
      const res = await g.TestedModule.csv_export(p1, conf, destStream, g.knex)
      destStream.end()
      const exported = destStream.toString()
      console.log(exported)
      exported.split('\n').should.have.lengthOf(3)
    })

    it('shall remove', async () => {
      const res = await g.TestedModule.remove(1, conf, g.knex)
      const q = { currentPage: 1, perPage: 10, sort: 'id:asc' }
      const res2 = await g.TestedModule.list(q, conf, g.knex)
      res2.data.should.have.lengthOf(1)
      res2.data[0].nazev.should.equal(p2.nazev)
    })

  })
}