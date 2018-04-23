var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var collectionName = 'categories';
var Category = mongoose.model('Category', new Schema({
    cat1:String,
    cat2:String,
    cat3:String,
    cat4:String,
    cat5:String,
    cat6:String,
    cat7:String,
    cat8:String,
    cat9:String,
    cat10:String,
    cat11:String,
    cat12:String
}), collectionName);
module.exports = Category;