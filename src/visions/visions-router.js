const path = require('path')
const express = require('express')
const xss = require('xss')
const VisionsService = require('./visions-service')

const visionsRouter = express.Router()
const jsonParser = express.json()

const serializeVisions = vision => ({
    id: vision.id,
    vision_image: vision.vision_image,
    vision_category: vision.vision_category,
    vision_room: vision.vision_room,
    note: xss(vision.note),
    link: vision.link,
  })

visionsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')  
    VisionsService.getAllVisions(knexInstance)
      .then(vision => {
        res.json(vision.map(serializeVisions))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { vision_image, vision_category, vision_room, note, link } = req.body
    const newVision = { vision_image, vision_category, vision_room}

    for (const [key, value] of Object.entries(newVision)) 
       if (value == null) 
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
    newVision.note = note;
    newVision.link = link;

    VisionsService.insertVision(
      req.app.get('db'),
      newVision
    )
      .then(vision => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${vision.id}`))
          .json(serializeVisions(vision))
      })
      .catch(next)
  })

visionsRouter
  .route('/:vision_id')
  .all((req, res, next) => {
       VisionsService.getById(
        req.app.get('db'),
        req.params.vision_id
     )
      .then(vision => {
        if (!vision) {
            return res.status(404).json({
                 error: { message: `Vision doesn't exist` }
               })
        }
          res.vision = vision
          next() // don't forget to call next so the next middleware happens!
        })
        .catch(next)
   })
   .get((req, res, next) => {
    res.json(serializeVisions(res.vision))
  })
  .delete((req, res, next) => {
    VisionsService.deleteVision(
        req.app.get('db'),
        req.params.vision_id
      )
        .then(() => {
           res.status(204).end()
        })
        .catch(next)
   })
   .patch(jsonParser, (req, res, next) => {
    const { vision_category, vision_room, vision_image, note, link } = req.body
    const visionToUpdate = { note, vision_category, link, vision_room, vision_image }

    const numberOfValues = Object.values(visionToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either an 'image','category', 'room', 'note' or 'link'`
        }
      })

    VisionsService.updateVision(
      req.app.get('db'),
      req.params.vision_id,
      visionToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = visionsRouter