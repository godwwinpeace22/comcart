var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CartSchema = new Schema({
  cartUserId: {type:String},
  product : {type:Object}
});

var Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
