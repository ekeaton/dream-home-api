const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeVisionsArray, makeMaliciousVision } = require('./vision-fixtures')

describe('Vision Endpoints', function() {
let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('visions').truncate())

  afterEach('cleanup', () => db('visions').truncate())

  describe(`GET /api/visions`, () => {
    context(`Given no visions`, () => {
       it(`responds with 200 and an empty list`, () => {
            return supertest(app)
            .get('/api/visions')
            .expect(200, [])
        })
    })
    context('Given there are visions in the database', () => {
      const testVisions = makeVisionsArray()

      beforeEach('insert visions', () => {
        return db
          .into('visions')
          .insert(testVisions)
      })

      it('responds with 200 and all of the visions', () => {
        return supertest(app)
          .get('/api/visions')
          .expect(200, testVisions)
      })
    })

    context(`Given an XSS attack vision`, () => {
        const { maliciousVision, expectedVision } = makeMaliciousVision()
  
        beforeEach('insert malicious vision', () => {
          return db
            .into('visions')
            .insert([ maliciousVision ])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get('/api/visions')
            .expect(200)
            .expect(res => {
              expect(res.body[0].note).to.eql(expectedVision.note)
              expect(res.body[0].link).to.eql(expectedVision.link)
            })

          })
        })
     })

  describe(`GET /api/visions/:vision_id`, () => {
    context(`Given no visions`, () => {
      it(`responds with 404`, () => {
        const visionId = 123456
        return supertest(app)
         .get(`/api/visions/${visionId}`)
         .expect(404, { error: { message: `Vision doesn't exist` } })
        })
    })
        
    context('Given there are visions in the database', () => {
      const testVisions = makeVisionsArray()

      beforeEach('insert visions', () => {
        return db
          .into('visions')
          .insert(testVisions)
      })

      it('responds with 200 and the specified vision', () => {
        const visionId = 2
        const expectedVision = testVisions[visionId - 1]
        return supertest(app)
          .get(`/api/visions/${visionId}`)
          .expect(200, expectedVision)
      })
    })
    
    context(`Given an XSS attack vision`, () => {
        const { maliciousVision, expectedVision } = makeMaliciousVision()
  
        beforeEach('insert malicious vision', () => {
          return db
            .into('visions')
            .insert([ maliciousVision ])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/visions/${maliciousVision.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.note).to.eql(expectedVision.note)
              expect(res.body.link).to.eql(expectedVision.link)
            })
        })
     })
  })

  describe(`POST /api/visions`, () => {
    it(`creates a vision, responding with 201 and the new vision`,  function() {
        const newVision = {
          vision_image: "https://thd.co/2YjzOXl",
          vision_category: 'Lighting',
          vision_room: 'Bonus Room',
          note: '',
          link: 'http://loripsum.net/'
        }
         return supertest(app)
          .post('/api/visions')
          .send(newVision)
           .expect(201)
           .expect(res => {
             expect(res.body.vision_image).to.eql(newVision.vision_image)
             expect(res.body.vision_category).to.eql(newVision.vision_category)
             expect(res.body.vision_room).to.eql(newVision.vision_room)
             expect(res.body.note).to.eql(newVision.note)
             expect(res.body.link).to.eql(newVision.link)
             expect(res.body).to.have.property('id')
             expect(res.headers.location).to.eql(`/api/visions/${res.body.id}`)
          })
          .then(postRes =>
            supertest(app)
             .get(`/api/visions/${postRes.body.id}`)
             .expect(postRes.body)
            )
       })

     const requiredFields = ['vision_image','vision_category', 'vision_room']

     requiredFields.forEach(field => {
     const newVision = {
      vision_image: 'https://bit.ly/2Gn0qfX',
      vision_category: 'Doors',
      vision_room: 'Basement',
     }

     it(`responds with 400 and an error message when the '${field}' is missing`, () => {
       delete newVision[field]

       return supertest(app)
         .post('/api/visions')
         .send(newVision)
         .expect(400, {
           error: { message: `Missing '${field}' in request body` }
         })
      })
    })
    
    it('removes XSS attack content from response', () => {
        const { maliciousVision, expectedVision } = makeMaliciousVision()
        return supertest(app)
          .post(`/api/visions`)
          .send(maliciousVision)
          .expect(201)
          .expect(res => {
            expect(res.body.note).to.eql(expectedVision.note)
            expect(res.body.link).to.eql(expectedVision.link)
          })
      })

  })


  describe(`DELETE /api/visions/:vision_id`, () => {
    context(`Given no visions`, () => {
        it(`responds with 404`, () => {
         const visionId = 123456
         return supertest(app)
          .delete(`/api/visions/${visionId}`)
          .expect(404, { error: { message: `Vision doesn't exist` } })
        })
    })   
   context('Given there are visions in the database', () => {
      const testVisions = makeVisionsArray()
    
         beforeEach('insert visions', () => {
           return db
             .into('visions')
             .insert(testVisions)
         })
    
         it('responds with 204 and removes the vision', () => {
           const idToRemove = 2
           const expectedVisions = testVisions.filter(vision => vision.id !== idToRemove)
           return supertest(app)
             .delete(`/api/visions/${idToRemove}`)
             .expect(204)
             .then(res =>
               supertest(app)
                 .get(`/api/visions`)
                 .expect(expectedVisions)
             )
         })
       })
    })

    describe(`PATCH /api/visions/:vision_id`, () => {
       context(`Given no visions`, () => {
         it(`responds with 404`, () => {
               const visionId = 123456
               return supertest(app)
                 .patch(`/api/visions/${visionId}`)
              .expect(404, { error: { message: `Vision doesn't exist` } })
            })
        })

        context('Given there are visions in the database', () => {
            const testVisions = makeVisionsArray()
            
              beforeEach('insert visions', () => {
                   return db
                     .into('visions')
                     .insert(testVisions)
              })
            
              it('responds with 204 and updates the vision', () => {
                  const idToUpdate = 2
                   const updateVision = {
                    vision_image: "https://low.es/2XWzBdv",
                    vision_category: 'Counters',
                    vision_room: 'Basement',
                    note: 'Test note',
                    link: 'https://low.es/2K2olT5'
                  }
                  const expectedVision = {
                    ...testVisions[idToUpdate - 1],
                    ...updateVision
                  }
                   return supertest(app)
                    .patch(`/api/visions/${idToUpdate}`)
                    .send(updateVision)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                         .get(`/api/visions/${idToUpdate}`)
                         .expect(expectedVision)
                    )
             })

             it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                  return supertest(app)
                    .patch(`/api/visions/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                         error: {
                           message: `Request body must contain either an 'image','category', 'room', 'note' or 'link'`
                         }
                    })
                })
         })
     })
})