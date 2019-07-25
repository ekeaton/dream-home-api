const VisionsService = {
    getAllVisions(knex) {
      return knex.select('*').from('visions')
    },
  
    insertVision(knex, newVision) {
      return knex
        .insert(newVision)
        .into('visions')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('visions')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteVision(knex, id) {
      return knex('visions')
        .where({ id })
        .delete()
    },
  
    updateVision(knex, id, newVisionFields) {
      return knex('visions')
        .where({ id })
        .update(newVisionFields)
    },
  }
  
  module.exports = VisionsService