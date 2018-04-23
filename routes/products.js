var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var Review = require('../models/review');
var Cart = require('../models/cart');
var bodyParser = require('body-parser');
var moment = require('moment');
var async = require('async');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    let arr = file.mimetype.split('/');
    let extension = arr[arr.length - 1];
    cb(null, file.fieldname + Date.now() + '.' + extension)
  }
})

var upload = multer({ storage: storage })

router.get('/', function(req, res, next){
  Product.find({}, function(err, result){
    if(err) throw err;
      Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){
        res.render('index', {
          title:"Comcart Online Shopping Mall | Buy phones, fashion, electronics",
          products:result,
          cartCount:req.session.user ? cart.length : '',
          isLoggedIn:req.session.user
        });
      });

  })

});


router.get('/:category', function(req, res, next){
  Product.find({'category':req.params.category}, function(err, result){
    if(err) return next(err);
    console.log(result);
    Category.findOne({'title':req.params.category}, function(err, category){
      Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){
        res.render('products', {
          title:req.params.category,
          products: result,
          category:category,
          isLoggedIn:req.session.user,
          cartCount: req.session.user ? cart.length : ''
        });
      });
    }); //end category
  })
})


router.get('/description/:id', function(req, res, next){
  Product.findOne({'_id':req.params.id}, function(err, result){
    if(err) return next(err);
    Review.find({'refProduct': result._id}, function(err, reviews){
        Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){
          async.parallel({
            five_star_count: function(callback){
              Review.count({star:'5', refProduct:req.params.id}, callback);
            },
            four_star_count: function(callback){
              Review.count({star:'4', refProduct:req.params.id}, callback);
            },
            three_star_count: function(callback){
              Review.count({star:'3', refProduct:req.params.id}, callback);
            },
            two_star_count: function(callback){
              Review.count({star:'2', refProduct:req.params.id}, callback);
            },
            one_star_count: function(callback){
              Review.count({star:'1', refProduct:req.params.id}, callback);
            }
          }, function(err, asyncResults){
            console.log(asyncResults);
            console.log(asyncResults.one_star_count);
            var res5 = asyncResults.five_star_count;
            var res4 = asyncResults.four_star_count;
            var res3 = asyncResults.three_star_count;
            var res2 = asyncResults.two_star_count;
            var res1 = asyncResults.one_star_count;
            var totalReviews = res5 + res4 + res3 + res2 + res1;
            //if total review is zero set the average review to 0 so its wont return Nan to the views
            var avRev = totalReviews == 0 ? 0 : Math.round((res5*5 + res4*4 + res3*3 + res2*2 + res1)/(totalReviews) * 100)/100;
            ratings = {
              barFiveWidth: res5  == 0 ? 1 : res5 / totalReviews * 100,
              barFourWidth: res4  == 0 ? 1 : res4 / totalReviews * 100,
              barThreeWidth: res3 == 0 ? 1 : res3 / totalReviews * 100,
              barTwoWidth: res2   == 0 ? 1 : res2 / totalReviews * 100,
              barOneWidth: res1   == 0 ? 1 : res1 / totalReviews * 100,
            }
            var reviewCount = {
              reviewCountsOne:res1,
              reviewCountsTwo:res2,
              reviewCountsThree:res3,
              reviewCountsFour:res4,
              reviewCountsFive:res5
            }
            console.log(ratings);
            res.render('description', {
              title:'Product Description',
              product:result,
              reviews: reviews,
              cartCount:cart ? cart.length : '',
              totalReviews:totalReviews,
              ratings: ratings,
              avReview: avRev,
              reviewCount:reviewCount,
              isLoggedIn:req.session.user
            });
          })//end async
          
        });
    });
  });
});

//handle post request for comments and reviews
router.post('/description/:id', function(req, res, next){
    req.checkBody('title', 'this field cannot  be empty').notEmpty;
    req.checkBody('name', 'this field cannot  be empty').notEmpty;
    req.checkBody('commentBody', 'this field cannot  be empty').notEmpty;

    //run validation
    var errors = req.validationErrors();
    var review = new Review({
      title: req.body.title,
      commenter: req.body.name,
      commentBody: req.body.commentBody,
      refProduct: req.params.id,
      star:req.body.star,
      date: moment().format("D MMM YYYY")
    });

    if(errors){
      //If there are errors render the form again
      Product.findOne({'_id':req.params.id}, function(err, result){
        if(err) throw err
        Review.find({'refProduct': result._id}, function(err, reviews){
          Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){
            async.parallel({
              five_star_count: function(callback){
                Review.count({star:'5', refProduct:req.params.id}, callback);
              },
              four_star_count: function(callback){
                Review.count({star:'4', refProduct:req.params.id}, callback);
              },
              three_star_count: function(callback){
                Review.count({star:'3', refProduct:req.params.id}, callback);
              },
              two_star_count: function(callback){
                Review.count({star:'2', refProduct:req.params.id}, callback);
              },
              one_star_count: function(callback){
                Review.count({star:'1', refProduct:req.params.id}, callback);
              }
            }, function(err, asyncResults){
              console.log(asyncResults);
              var res5 = asyncResults.five_star_count;
              var res4 = asyncResults.four_star_count;
              var res3 = asyncResults.three_star_count;
              var res2 = asyncResults.two_star_count;
              var res1 = asyncResults.one_star_count;
              var totalReviews = res5 + res4 + res3 + res2 + res1;
              var avRev = totalReviews == 0 ? 0 : Math.round((res5*5 + res4*4 + res3*3 + res2*2 + res1)/(totalReviews) * 100)/100;
              ratings = {
                barFiveWidth: res5  == 0 ? 1 : res5 / totalReviews * 100,
                barFourWidth: res4  == 0 ? 1 : res4 / totalReviews * 100,
                barThreeWidth: res3 == 0 ? 1 : res3 / totalReviews * 100,
                barTwoWidth: res2   == 0 ? 1 : res2 / totalReviews * 100,
                barOneWidth: res1   == 0 ? 1 : res1 / totalReviews * 100,
              };
              var reviewCount = {
                reviewCountsOne:res1,
                reviewCountsTwo:res2,
                reviewCountsThree:res3,
                reviewCountsFour:res4,
                reviewCountsFive:res5
              }
            res.render('description', {
              title:'Description',
              product:result,
              ratings: ratings,
              avReview: avRev,
              reviewCount:reviewCount,
              cartCount:cart ? cart.length : '',
              isLoggedIn:req.session.user
            });
          }); //end async
          });
          return;
        });

      });

    }

    else{
      review.save(function(err){
        if(err){return next(err)};
        console.log(review);
        //user review saved.
        Product.findOne({'_id':req.params.id}, function(err, result){
          if(err) throw err
          Review.find({'refProduct': result._id}, function(err, reviews){
            Cart.find({'cartUserId': req.session.user ? req.session.user._id : ''}, function(err, cart){

              async.parallel({
                five_star_count: function(callback){
                  Review.count({star:'5', refProduct:req.params.id}, callback);
                }, 
                four_star_count: function(callback){
                  Review.count({star:'4', refProduct:req.params.id}, callback);
                },
                three_star_count: function(callback){
                  Review.count({star:'3', refProduct:req.params.id}, callback);
                },
                two_star_count: function(callback){
                  Review.count({star:'2', refProduct:req.params.id}, callback);
                },
                one_star_count: function(callback){
                  Review.count({star:'1', refProduct:req.params.id}, callback);
                }
              }, function(err, asyncResults){
                console.log(asyncResults);
                var res5 = asyncResults.five_star_count;
                var res4 = asyncResults.four_star_count;
                var res3 = asyncResults.three_star_count;
                var res2 = asyncResults.two_star_count;
                var res1 = asyncResults.one_star_count;
                var totalReviews = res5 + res4 + res3 + res2 + res1;
                var avRev = totalReviews == 0 ? 0 : Math.round((res5*5 + res4*4 + res3*3 + res2*2 + res1)/(totalReviews) * 100)/100;
                ratings = {
                  barFiveWidth: res5  == 0 ? 1 : res5 / totalReviews * 100,
                  barFourWidth: res4  == 0 ? 1 : res4 / totalReviews * 100,
                  barThreeWidth: res3 == 0 ? 1 : res3 / totalReviews * 100,
                  barTwoWidth: res2   == 0 ? 1 : res2 / totalReviews * 100,
                  barOneWidth: res1   == 0 ? 1 : res1 / totalReviews * 100,
                }
                var reviewCount = {
                  reviewCountsOne:res1,
                  reviewCountsTwo:res2,
                  reviewCountsThree:res3,
                  reviewCountsFour:res4,
                  reviewCountsFive:res5
                }
                res.render('description', {
                  title:'Description',
                  product:result,
                  reviews: reviews,
                  totalReviews:totalReviews,
                  ratings: ratings,
                  avReview: avRev,
                  reviewCount:reviewCount,
                  cartCount:cart ? cart.length : '',
                  reviewCounts:asyncResults,
                  isLoggedIn:req.session.user
                });
              }); //end async
            });

          });

        });
      })
    }//end else

});

var requireLogin = function(req, res, next) {
  if (!req.session.user) {
    res.redirect('/users/login');
  } else {
    next();
  }
};


router.get('/admin/create', requireLogin, function(req, res, next){
  console.log('create view');
  if(req.session.user){
    Cart.find({'cartUserId': req.session.user._id}, function(err, cart){
      res.render('create', {
        title:'Add a product',
        cartCount:cart.length,
        isLoggedIn:req.session.user
      });
    });
  }
  else{
    res.render('create', {
      title:'Add a product',
      isLoggedIn:req.session.user
    });
  }

});
router.post('/admin/create', upload.array('productImg', 4), function(req, res, next){
  //console.log(req.body);
  //console.log(req.files);
  product = new Product({
    name:req.body.name,
    description:req.body.description,
    productImgUrl1:req.files.length != 0 ? req.files[0].filename : "",
    productImgUrl2:req.files.length >= 2 ? req.files[1].filename : "",
    productImgUrl3:req.files.length >= 3 ? req.files[2].filename : "",
    productImgUrl4:req.files.length >= 4 ? req.files[3].filename : "",
    formerPrice:req.body.formerPrice,
    currentPrice:req.body.currentPrice,
    manufacturer:req.body.manufacturer,
    seller:req.body.seller,
    sellerRating:req.body.sellerRating,
    noSold:req.body.noSold,
    warrantee:req.body.warrantee,
    instock:req.body.instock,
    noInstock:req.body.noInstock,
    category:req.body.category,
    subcategory:req.body.subcategory,
    tags:req.body.tags,
    type:req.body.type
  });
  product.save(function(err){
    if(err) return next(err);
    console.log(product);
    res.redirect('/');
  });
});

var requireLoginAdmin = function(req, res, next){
  if(!req.session.user){
    res.redirect('/users/login');
  }
  else if(req.session.user._id != '5a1c8a2dcf3a221388eb0474'){
    res.redirect('/users/login');
    console.log(req.session.user._id);
  }
  else {
    next();
  }
}

router.get('/admin/categories', requireLoginAdmin, function(req, res, next){
  res.render('categories', {
    title: 'Categories | Admin Panel'
  });
});

router.post('/admin/categories', requireLoginAdmin, function(req, res, next){

  category = new Category({
    title:req.body.title,
    cat1:req.body.cat1,
    cat2:req.body.cat2,
    cat2:req.body.cat3,
    cat2:req.body.cat4,
    cat5:req.body.cat5,
    cat6:req.body.cat6,
    cat7:req.body.cat7,
    cat8:req.body.cat8,
    cat9:req.body.cat9,
    cat10:req.body.cat10,
    cat11:req.body.cat11,
    cat12:req.body.cat12
  });
  
  category.save(function(err, result){
    if(err) throw err;
    else{
      console.log('category saved --  ' + category);
      res.render('categories', {title:'Categories | Admin Panel'});
    }
  });
});
module.exports = router;
