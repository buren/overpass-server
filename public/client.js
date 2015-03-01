CLIENT_ID = '8989';

window.onload = function() {
  var hideDialog = function() {
    $('.app-dialog').fadeOut(300);
  }

  var showDialog = function() {
    $('.app-dialog').fadeIn(300);
  }

  var $cliInput = $('#cli-cmd');

  cliModel = function() {
    var self        = this;
    self.cliString  = ko.observable();
    self.cliHistory = ko.observableArray([]);
    self.responses  = ko.observableArray([]);

    self.sendCli = function () {
      var cmd = self.cliString;
      if (cmd === '') {
        alert('Enter something in input field');
      } else {
        var cmdObj = { cmd: cmd };
        var msg    = {
          type: 'message',
          cmd:  cmd,
          id:   CLIENT_ID,
          date: Date.now()
        };
        console.log('Sending command: $', cmd);
        self.cliString = ''; // FIXME: Why does this not clear the input??
        $cliInput.val('');   // Shouldn't be needed the above line *should, but doesn't, clear it
        self.cliHistory.push(cmdObj);
        webSocket.send(JSON.stringify(msg));
      }
    };
  }

  ko.applyBindings(new cliModel());

  var webSocketUrl = function() {
    var serverIp = $('#server-ip').attr('data-server-ip');
    return 'ws://' + serverIp + ':3702';
  };

  var webSocket = new WebSocket(webSocketUrl());
  webSocket.onopen  = function(event) { console.log('open: ', event); };
  webSocket.onclose = function(event) { console.log('close: ', event); };
  webSocket.onerror = function(event) { console.log('error: ', event); };
  webSocket.onmessage = function(event) {
    var data = event.data;

    var parsedData = null;
    if (data.indexOf('server:')) {
      parsedData = JSON.parse(data);
    } else {
      parsedData = {};
    }

    if (data === 'Phone connected') {
      console.log('should init');
      hideDialog();
    } else if (data === 'Phone disconnected') {
      console.log('should tear down');
      showDialog();
    } else if (parsedData.location !== undefined) {
      var latLong   = parsedData.location.split(',');
      var latitude  = parseFloat(latLong[0]);
      var longitude = parseFloat(latLong[1]);
      var gLatLong  = new google.maps.LatLng(latitude, longitude);

      var gMapOpts = {
        zoom: 16,
        center: gLatLong,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var myMarker = new google.maps.Marker({
        position: gLatLong,
        draggable: true
      });
      var map = new google.maps.Map(document.getElementById('phone-location-map'), gMapOpts);
      $('#phone-location-map').css('height', '300px')
      myMarker.setMap(map);
    }
    console.log(data);
  };
};
