var express = require('express');
var app = express();
var router = express.Router();
var session = require('client-sessions');
var User = require('../models/user');
var Product = require('../models/product');
const dotenv = require('dotenv').config();
var Cart = require('../models/cart');
const stripe = require("stripe")(process.env.secretKey);
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next){
  res.render('register', {title: 'Register'});
});
router.get('/login', function(req,res,next){
  res.render('login', {title:'Login', isLoggedIn: false});
});

//Handle post request for registeration
router.post('/register', function(req, res, next){
  req.checkBody('name', 'Please provide a name').notEmpty();
  req.checkBody('username', 'Please provide a username').notEmpty();
  req.checkBody('email', 'Please provide a valid email').isEmail();
  req.checkBody('billingAddr', 'Please provide an address').notEmpty();
  req.checkBody('password', 'Please provide a password').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  //create a new user object
  user = new User({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email,
    billingAddr: req.body.billingAddr,
    password:req.body.password
  });

  //run the validators
  var errors = req.validationErrors();

  if(errors){
    //if there are errors in the form
    res.render('register', {
      title:'Register',
      errors:errors,
      name:req.body.name,
      username:req.body.username,
      email:req.body.email,
      password:req.body.password
    });
    return;
  }

  else{
    //there are no errors
    //check if the username is already in ther database
    User.findOne({'username':req.body.username})
    .exec(function(err, result){
      if(err){return next(err)};
      if(result){
        //if the username already exists
        console.log(result.username + 'is already in the database');
        res.render('register', {
          title:'Register',
          msg: 'Sorry, the username is already in use',
          name:req.body.name,
          username:req.body.username,
          email:req.body.email,
          password:req.body.password
        });
      }

      else{
        console.log('user not found in database, u can proceed');
        user.save(function(err){
          if(err){return next(err)};
          console.log(user);
          //user saved, redirect to login page
          res.redirect('/users/login');
        });
      }
    });
  }
});

//Handel POST request for login
router.post('/login', function(req, res){
  User.findOne({'username':req.body.username}, function(err, result){
    if(err) throw err;
    if(!result){
      //the user is not found
      console.log('Unknown User');
      res.render('login', {
        title:'Login | Comcart',
        msg: 'Incorrect username',
        username:req.body.username,
        password:req.body.password
      });
    }
    else{
      //the username is found in the database
      if(result.password !== req.body.password){
        console.log('password incorrect');
        res.render('login', {
          title:'Login | Comcart',
          msg: 'Incorrect password',
          username: req.body.username,
          password: req.body.password
        });
      }
      else{
        //Authentication successful
        // sets a cookie with the user's info
        req.session.user = result;
        console.log('Authentication successful, redirecting...');
        console.log(result)
        res.redirect('/');

      }
    }
  });
});

//middleware for login sessions
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8cfduid=d947a1e78dbfc5a9724221256d8e74ec61509648166; km_ai=TZLuPpaGmSXwovyf1elXuCsQiKc%3D%7B%22235933559%22%3A%22direct%22%2C%22235965382%22%3A%22gc%22%2C%22235970372%22%3A%22false%22%7D',
  duration: 7 * 24 * 60 * 60 * 1000,
  activeDuration: 100 * 60 * 1000,
  httpOnly: true,
  secure: false,
  ephemeral: true
}));

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({'username': req.session.user.username }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

//function to run to check if user is in session or not
var requireLogin = function(req, res, next) {
  if (!req.session.user) {
    res.redirect('/users/login');
  } else {
    next();
  }
};


//logout session
router.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/users/login');
});

router.post('/user/addcart/:productId', function(req, res, next){
  if(req.session.user){
    Product.findOne({'_id':req.params.productId}, function(err, result){
      cart = new Cart({
        cartUserId: req.session.user._id,
        product : result
      });
      cart.save(function(err, cart){
        if(err)  throw err
        //find all the carts with the id of the user in session
        Cart.find({'cartUserId': req.session.user._id}, function(err, result){
          console.log(result);
          res.send({cartCount:result.length});
        });
      }); //save cart
    });
  }
  else{
    res.send('You must be logged in to add an item to cart');
  }
});

//handle checkout
router.get('/checkout', requireLogin, function(req, res, next){
    Cart.find({'cartUserId':req.session.user._id}, function(err, response){
      if(err) return next(err);
      console.log(response);
      var arr = [];
      for(i=0;i<response.length; i++){
        arr.push(response[i].product.currentPrice);
      }
      if(arr.length >= 2){
        var subtotal = arr.reduce(function(a,b){
          return a + b
        });
        console.log(subtotal);
        res.render('checkout', {
          title:'Checkout | Comcart',
          results: response,
          subtotal:subtotal,
          cartCount: response.length,
          publishableKey: process.env.publishableKey,
          isLoggedIn:req.session.user
        });
      }
      else{
        // only one item is in the cart
        var subtotal = arr[0];
        console.log(subtotal);
        res.render('checkout', {
          title:'Checkout | Comcart',
          results: response,
          subtotal:subtotal,
          cartCount: response.length,
          isLoggedIn:req.session.user
        });
      }
      
    });

});
//handle when a user removes item from cart
router.post('/checkout/:productId', function(req, res, next){
  Cart.remove({'_id': req.params.productId},function(err){
    if(err) return next(err);
    console.log(req.params.productId + 'has been removed');
    res.send('The item has been removed');
  })
});

//when a user clicks on 'Proceed to chechout', remove all the items in the cart and update noSold to + 1
router.get('/pay', requireLogin, function(req, res, next){
  Cart.find({'cartUserId': req.session.user._id},function(err, cart){
    if(err) return next(err);
    for(i=0;i<cart.length; i++){
      //check if the number instock is greater than zero before subtracting and update the route accordingly
      var update = {noSold:cart[i].product.noSold + 1, noInstock:cart[i].product.noInstock > 0 ? cart[i].product.noInstock - 1 : cart[i].product.noInstock};
      var query = {_id:cart[i].product._id};
      Product.update(query, update, function(err, update){
        if(err) throw err;
        
      });
    }
  });

    //remove all the user's items in cart
    Cart.remove({'cartUserId':req.session.user._id}, function(err){
      res.render('pay', {
        title:'Pay | Comcart',
        cartCount: 0,
        message:'Thank you for purchasing this product',
        isLoggedIn:req.session.user
      });
    });
    
  });

router.post('/pay/:amount', requireLogin, function(req,res,next){

  stripe.customers.create({
    email: req.body.stripeEmail,
   source: req.body.stripeToken
 })
 .then(customer =>
   stripe.charges.create({
     amount:req.params.amount,
     description: "Sample Charge",
        currency: "usd",
        customer: customer.id
   }))
 .then(charge => res.redirect('/users/pay'));
})
module.exports = router;
