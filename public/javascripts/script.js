function addToCart(a) {
  var productId = $('.link').attr('productId');
  var isLoggedIn = $('.link').attr('isLoggedIn');
  console.log(typeof isLoggedIn);
  //isLoggedIn returns a string 'undefined' if logged out, and '[object object]' if logged in
  if(isLoggedIn !== 'undefined'){
    $.post('/users/user/addcart/' + productId, function(response){
      console.log(response);
      $('.count').text('(' + response.cartCount + ')');
      $('.addToCart').text('Added to cart');
      $('.addToCart').attr('disabled', true);
    });
  }
  else{
    //alert('isLoggedIn is false');
    $('.message').show('slow');
  }


}


function removeItem(){
  var productId = $('.remove').attr('productId');
  $.post('/users/checkout/' + productId, function(response){
    location.reload()
  })
}

$('#imghover1').on('mouseover', function(){
  $('#imghover1').css({'cursor':'pointer'});
  var attr = $('#imghover1').prop('src');
  $('.cover').fadeIn('slow');
  $('.coverimg').attr('src', attr);
});
$('#imghover1').on('mouseout', function(){
  $('.cover').fadeOut();
})

$('#imghover2').on('mouseover', function(){
  $('#imghover2').css({'cursor':'pointer'});
  var attr = $('#imghover2').prop('src');
  $('.cover').fadeIn('slow');
  $('.coverimg').attr('src', attr);
});
$('#imghover2').on('mouseout', function(){
  $('.cover').fadeOut();
});

$('#imghover3').on('mouseover', function(){
  $('#imghover3').css({'cursor':'pointer'});
  var attr = $('#imghover3').prop('src');
  $('.cover').fadeIn('slow');
  $('.coverimg').attr('src', attr);
});
$('#imghover3').on('mouseout', function(){
  $('.cover').fadeOut();
})

function one(){
  $('.yourRating .fa-star').removeClass('checked');
  $('.one').addClass('checked');
  $('.storeAttr').attr('value', 1);
}
function two(){
  $('.yourRating .fa-star').removeClass('checked');
  $('.one, .two').addClass('checked');
  $('.storeAttr').attr('value', 2);
  var attr = $('.storeAttr').attr('value');
}
function three(){
  $('.yourRating .fa-star').removeClass('checked');
  $('.one, .two, .three').addClass('checked');
  $('.storeAttr').attr('value', 3);
}
function four(){
  $('.yourRating .fa-star').removeClass('checked');
  $('.one, .two, .three, .four').addClass('checked');
  $('.storeAttr').attr('value', 4);
}
function five(){
  $('.yourRating .fa-star').removeClass('checked');
  $('.one, .two, .three, .four, .five').addClass('checked');
  $('.storeAttr').attr('value', 5);
}


$(function(){
  //add class 'checked' to the right elements depending on the amount of the avReview
  var avReview = $('.fa-star').attr('avReview');
  if(avReview == 0){
    
  }
  else if(avReview <1.5){
    $('.class1').addClass('checked');
  }
  else if(avReview >= 1.5 && avReview < 2){
    $('.class1').addClass('checked');
    $('.class2').removeClass('fa-star');
    $('.class2').addClass('fa-star-half');
    $('.class2').addClass('checked');
  }
  else if(avReview >= 2 && avReview <2.5){
    $('.class1, .class2').addClass('checked');
  }
  else if(avReview >=2.5 && avReview <3){
    $('.class1, .class2').addClass('checked');
    $('.class3').removeClass('fa-star');
    $('.class3').addClass('fa-star-half');
    $('.class3').addClass('checked');
  }
  else if(avReview >= 3 && avReview <3.5){
    $('.class1, .class2, .class3').addClass('checked');
  }
  else if(avReview >=3.5 && avReview <4){
    $('.class1, .class2, .class3').addClass('checked');
    $('.class4').removeClass('fa-star');
    $('.class4').addClass('fa-star-half');
    $('.class4').addClass('checked');
  }
  else if(avReview >= 4 && avReview <4.5){
    $('.class1, .class2, .class3, .class4').addClass('checked');
    $('.class4').addClass('checked');
  }
  else if(avReview >=3.5 && avReview <4){
    $('.class1, .class2, .class3, .class4').addClass('checked');
    $('.class5').removeClass('fa-star');
    $('.class5').addClass('fa-star-half');
    $('.class5').addClass('checked');
  }
  else{
    $('.class1, .class2, .class3, .class4, .class5').addClass('checked');
  }
})