const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray, makeMaliciousNote } = require('./note-fixtures')

describe('Note Endpoints', function() {
let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('notes').truncate())

  afterEach('cleanup', () => db('notes').truncate())

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
       it(`responds with 200 and an empty list`, () => {
            return supertest(app)
            .get('/api/notes')
            .expect(200, [])
        })
    })
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })

    context(`Given an XSS attack note`, () => {
        const { maliciousNote, expectedNote } = makeMaliciousNote()
  
        beforeEach('insert malicious note', () => {
          return db
            .into('notes')
            .insert([ maliciousNote ])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get('/api/notes')
            .expect(200)
            .expect(res => {
              expect(res.body[0].note).to.eql(expectedNote.note)
            })

          })
        })
     })

  describe(`GET /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
         .get(`/api/notes/${noteId}`)
         .expect(404, { error: { message: `Note doesn't exist` } })
        })
    })
        
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })
    
    context(`Given an XSS attack note`, () => {
        const { maliciousNote, expectedNote } = makeMaliciousNote()
  
        beforeEach('insert malicious note', () => {
          return db
            .into('notes')
            .insert([ maliciousNote ])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/notes/${maliciousNote.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.note).to.eql(expectedNote.note)
            })
        })
     })
  })

  describe(`POST /api/notes`, () => {
    it(`creates a note, responding with 201 and the new note`,  function() {
        const newNote = {
          name: "New House Plan",
          bedrooms: 3,
          bathrooms: 3,
          sq_ft: 4000,
          note: ''
        }
         return supertest(app)
          .post('/api/notes')
          .send(newNote)
           .expect(201)
           .expect(res => {
             expect(res.body.name).to.eql(newNote.name)
             expect(res.body.bedrooms).to.eql(newNote.bedrooms)
             expect(res.body.bathrooms).to.eql(newNote.bathrooms)
             expect(res.body.sq_ft).to.eql(newNote.sq_ft)
             expect(res.body.note).to.eql(newNote.note)
             expect(res.body).to.have.property('id')
             expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
          })
          .then(postRes =>
            supertest(app)
             .get(`/api/notes/${postRes.body.id}`)
             .expect(postRes.body)
            )
       })

     const requiredFields = ['name','bedrooms', 'bathrooms']

     requiredFields.forEach(field => {
     const newNote = {
      name: 'Modern House Plan',
      bedrooms: 1,
      bathrooms: 1,
     }

     it(`responds with 400 and an error message when the '${field}' is missing`, () => {
       delete newNote[field]

       return supertest(app)
         .post('/api/notes')
         .send(newNote)
         .expect(400, {
           error: { message: `Missing '${field}' in request body` }
         })
      })
    })
    
    it('removes XSS attack content from response', () => {
        const { maliciousNote, expectedNote } = makeMaliciousNote()
        return supertest(app)
          .post(`/api/notes`)
          .send(maliciousNote)
          .expect(201)
          .expect(res => {
            expect(res.body.note).to.eql(expectedNote.note)
          })
      })

  })


  describe(`DELETE /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
        it(`responds with 404`, () => {
         const noteId = 123456
         return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
        })
    })   
   context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()
    
         beforeEach('insert notes', () => {
           return db
             .into('notes')
             .insert(testNotes)
         })
    
         it('responds with 204 and removes the note', () => {
           const idToRemove = 2
           const expectedNote = testNotes.filter(note => note.id !== idToRemove)
           return supertest(app)
             .delete(`/api/notes/${idToRemove}`)
             .expect(204)
             .then(res =>
               supertest(app)
                 .get(`/api/notes`)
                 .expect(expectedNote)
             )
         })
       })
    })

    describe(`PATCH /api/notes/:note_id`, () => {
       context(`Given no notes`, () => {
         it(`responds with 404`, () => {
               const noteId = 123456
               return supertest(app)
                 .patch(`/api/notes/${noteId}`)
              .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })

        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray()
            
              beforeEach('insert notes', () => {
                   return db
                     .into('notes')
                     .insert(testNotes)
              })
            
              it('responds with 204 and updates the note', () => {
                  const idToUpdate = 2
                   const updateNote = {
                    name: "Updated House Plan",
                    bedrooms: 6,
                    bathrooms: 4,
                    sq_ft: 3567,
                    note: 'Test note'
                  }
                  const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updateNote
                  }
                   return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send(updateNote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                         .get(`/api/notes/${idToUpdate}`)
                         .expect(expectedNote)
                    )
             })

             it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                  return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                         error: {
                           message: `Request body must contain either 'name','bedrooms' or 'bathrooms'`
                         }
                    })
                })
         })
     })
})