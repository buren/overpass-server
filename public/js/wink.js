var initWink = function () {
  setInterval(function() {
    var profileImage = $('#phifflarn-profile');
    profileImage.attr('src', profileImage.attr('data-wink'));
    setTimeout(function() {
      profileImage.attr('src', profileImage.attr('data-src'));
    }, 200);
  }, 3000);

  setInterval(function() {
    var profileImage = $('#buren-profile');
    profileImage.attr('src', profileImage.attr('data-wink'));
    setTimeout(function() {
      profileImage.attr('src', profileImage.attr('data-src'));
    }, 200);
  }, 5000);
}
