var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  name:{
    type: String
  },
  username:{
    type:String
  },
  email:{
    type:String
  },
  billingAddr:{
    type:String
  },
  password:{
    type:String
  },
  cart:{
    type:String
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
