$(document).on('scroll', function() {
  _navbar_margin = 30;
  _mobile = false;

  if (_mobile === true) {
    if (_stop_scroll_poll === false){
      var color = 'rgba(255, 255, 255, 1)';
      $('#hackathon-navbar').css('background-color', color);
    }
    _stop_scroll_poll = true;
    return;
  }
  if ($(window).width() < 768) // return if mobile menu
    return;

  scrollTop = $(window).scrollTop();
  var navbarMargin =  _navbar_margin - scrollTop;
  if (navbarMargin < 0) {
    navbarMargin = 0;
  }
  $('#hackathon-navbar').css('margin-top', navbarMargin);

  if (scrollTop < 0) {
    scrollTop *= -1; // For OSX where scroll past top is possible
  }

  var opacity = scrollTop/100;
  if (opacity > 0.8){
    opacity = 0.8;
  }else if (opacity < 0.1){
    opacity = 0;
  }
  var color = 'rgba(255, 255, 255, ' + opacity + ')';
  $('#hackathon-navbar').css('background-color', color);

});
