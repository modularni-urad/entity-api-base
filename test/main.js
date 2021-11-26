/* global describe before after */
// const fs = require('fs')
import chai from 'chai'
import conf from './config'
import ApiError from './error'

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
    g.EntityMW = g.TestedModule(conf, g['knex'], ApiError)
  })

  describe('API', () => {
    const submodules = [
      './projects',
      './pagination'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
