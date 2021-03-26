const Joi = require("joi");

const locationSchema = Joi.object({
  location: Joi.object({
    title: Joi.string().required(),
    budget: Joi.number().required().min(0),
    description: Joi.string().required(),
    address: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});

module.exports = { locationSchema, reviewSchema };
