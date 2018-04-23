var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProductSchema = new Schema({
  name:{type:String},
  description:{type:String},
  productImgUrl1:{type:String},
  productImgUrl2:{type:String},
  productImgUrl3:{type:String},
  productImgUrl4:{type:String},
  formerPrice:{type:Number},
  currentPrice:{type:Number},
  manufacturer:{type:String},
  seller:{type:String},
  sellerRating:{type:Number},
  noSold:{type:Number},
  warrantee:{type:String},
  instock:{type:String},
  noInstock:{type:Number},
  category:{type:String},
  subcategory:{type:String},
  tags:{type:String},
  type:{type:String}
});
ProductSchema.index({'$**': 'text'});
Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
