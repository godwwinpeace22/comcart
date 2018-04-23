var mongoose = require('mongoose');
//define a schema
var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
  title: {type:String},
  commenter:{type:String},
  commentBody:{type:String},
  refProduct:{type:String},
  star:{type:Number},
  date:{type:String}
});

var Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
