const Joi = require("joi");

const locationSchema = Joi.object({
  location: Joi.object({
    title: Joi.string().required(),
    budget: Joi.number().required().min(0),
    image: Joi.string().required(),
    description: Joi.string().required(),
    address: Joi.string().required(),
  }).required(),
});

module.exports = { locationSchema };
