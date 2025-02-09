var mongoose = require("mongoose");
var moment = require('moment');
var passportLocalMongoose = require("passport-local-mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

messageSchema.methods.formatDate = function() {
  return moment(this.timestamp).format('MMM D, h:mm a');
};
messageSchema.plugin(passportLocalMongoose, {usernameUnique : false});
module.exports = mongoose.model('Message', messageSchema);
