/* global describe before after */
// const fs = require('fs')
import chai from 'chai'

import TestedModule from '../index'
import dbinit from './utils/dbinit'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const g = {
  TestedModule
}

describe('app', () => {

  before(async () => {
    g['knex'] = await dbinit()
  })

  describe('API', () => {
    const submodules = [
      './projects'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
