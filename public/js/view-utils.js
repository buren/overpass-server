window.onload = function() {
  initWink();

  $('.anchor-link').click(function(e){
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $($.attr(this, 'href')).offset().top
    }, 1000);
  });
};
