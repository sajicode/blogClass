const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  content: {
    type: String,
    required: true,
  },

  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comment'
  }]
});

const Post = mongoose.model('post', PostSchema);

module.exports = {Post};