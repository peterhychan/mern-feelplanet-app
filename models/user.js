const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

// Reference: https://www.npmjs.com/package/passport-local-mongoose

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
