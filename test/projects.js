import assert from 'assert'
import ApiError from './error'
const chai = require('chai')
chai.should()
var streams = require('memory-streams')
// import _ from 'underscore'

module.exports = (g) => {

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
        g.EntityMW.check_data({ nazev: 'ahoj' })
      })
    })

    it('shall pass check_data', async () => {
      assert.ok(async () => {
        g.EntityMW.check_data(p1)
      })
    })

    it('must not pass check_data', async () => {
      await assert.rejects(async () => {
        const wrongdata = Object.assign({}, p1, { ahoj: 'cau' })
        const res = await g.EntityMW.check_data(wrongdata)
      })
    })

    it('shall create a new item', async () => {
      const res = await g.EntityMW.create(p1)
    })

    it('shall list the pok1', async () => {
      const query = {
        filter: { nazev: p1.nazev }
      }
      const res = await g.EntityMW.list(query)
      res.should.have.lengthOf(1)
      res[0].nazev.should.equal(p1.nazev)
    })

    it('list must fail with APIError', async () => {
      try {
        await g.EntityMW.get(1333)
        throw new Error('did not fail!!')
      } catch (err) {
        const rightClass = err instanceof ApiError
        rightClass.should.be.ok
      }      
    })

    // it('shall not list with insufficient constraints', async () => {
    //   await assert.rejects(async () => {
    //     return g.TestedModule.list({}, conf, g.knex)
    //   })
    // })

    it('shall update', async () => {
      const res = await g.EntityMW.update(1, { nazev: 'gandalf' })
      // res.id.should.equal(1)
    })

    it('must not update not editable param', async () => {
      try {
        const res = await g.EntityMW.update(1, { created: new Date() })
        throw new Error('did not fail!!')
      } catch (err) {
        const rightClass = err instanceof ApiError
        rightClass.should.be.ok
      }
    })

    it('shall get the pok1 with pagination', async () => {
      const q = { currentPage: 1, perPage: 10, sort: 'id:asc' }
      const res = await g.EntityMW.list(q)
      res.pagination.total.should.equal(1)
      res.data.should.have.lengthOf(1)
      res.data[0].nazev.should.equal('gandalf')
    })

    it('shall get export', async () => {
      await g.EntityMW.create(p2)  
      var destStream = new streams.WritableStream()
      const res = await g.EntityMW.csv_export(p1, destStream)
      destStream.end()
      const exported = destStream.toString()
      console.log(exported)
      exported.split('\n').should.have.lengthOf(3)
    })

    it('shall remove', async () => {
      const res = await g.EntityMW.remove(1)
      const q = { currentPage: 1, perPage: 10, sort: 'id:asc' }
      const res2 = await g.EntityMW.list(q)
      res2.data.should.have.lengthOf(1)
      res2.data[0].nazev.should.equal(p2.nazev)
    })

  })
}