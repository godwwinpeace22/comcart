var express = require('express');
var Cart = require('../models/cart');
var Product = require('../models/product');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  Product.find({}, function(err, result){
    if(err) throw err;
    console.log(req.query)
    console.log(req.query.search)
      Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){
        Product.find({$text: {$search: req.query.search}},(err,searchResults)=>{
          res.render(req.query.search == undefined ? 'index' : 'products' , {
            title:"Comcart Online Shopping Mall | Buy phones, fashion, electronics",
            products:req.query.search == undefined ? result : searchResults,
            cartCount:req.session.user ? cart.length : '',
            isLoggedIn:req.session.user
          });
        })
      });
  })
});

module.exports = router;
