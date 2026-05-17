const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema(
  {
    _id: String,
    category: { type: String, required: true },
    title: String,
    content: [String],
  },
  { collection: 'topics' },
);

module.exports = mongoose.model('Topic', TopicSchema);
