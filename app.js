var express         = require('express');
var lessMiddleware  = require('less-middleware');
var WebSocketServer = require('ws').Server;
var os              = require('os');
var merge           = require('merge'), original, cloned;
var posix           = require('posix');

CLIENT_ID = '8989';
MAX_SOCKET_CONNECTIONS = 10000;

// raise maximum number of open file descriptors to 10k,
// hard limit is left unchanged
posix.setrlimit('nofile', { soft: MAX_SOCKET_CONNECTIONS });

// Set server ip-address
var ifaces   = os.networkInterfaces();
var serverIp = null;
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 address
      console.log(ifname, iface.address);
      // FIXME: Hardcoded network interface is a bad idea
      if (ifname === 'en0') {
        serverIp = iface.address;
      }
    }
  });
});

var app = express();

var serverPort = 3700,
    phonePort  = 3701,
    clientPort = 3702;

//
//Configure view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.use(lessMiddleware({
  src: __dirname + '/public',
  compress: true,
  force: true
}));

app.use(express.static(__dirname + '/public'));

var writeMessage = function(client, message) {
  if (client !== null && client !== undefined) {
    client.send(message);
  } else {
    return false;
  }
  return true;
};

var parseCmd = function(cmdString) {
  var data  = {
    id: CLIENT_ID,
    cmd: cmdString
  };
  var index = cmdString.indexOf(':');
  if (index !== -1) {
    var keyName   = cmdString.slice(0, index).toLowerCase();
    data[keyName] = cmdString.slice(index + 2, cmdString.length);
  }
  return data;
};

//
//Configure websockets
var clientSocket       = null;
var phoneSocket        = null;
var clientSocketServer = new WebSocketServer({ port: clientPort });
var phoneSocketServer  = new WebSocketServer({ port: phonePort });

clientSocketServer.on('connection', function(webSocket) {
  clientSocket = webSocket;
    webSocket.on('message', function(message) {
      var jsonString  = null;
      var messageData = JSON.parse(message);
      if (messageData.cmd !== undefined) {
        jsonString = JSON.stringify(parseCmd(messageData.cmd));
      } else {
        jsonString = JSON.stringify({});
      }
      console.log('client: %s', jsonString);

      writeMessage(phoneSocket, jsonString);
      writeMessage(clientSocket, jsonString);
    });
  webSocket.send('server: Connection accepted.');

  webSocket.on('close', function() {
    console.log('client websocket connection close')
  });
});

phoneSocketServer.on('connection', function(webSocket) {
  phoneSocket = webSocket;
  webSocket.on('message', function(message) {
    console.log('phone: %s', message);
    writeMessage(clientSocket, message);
    writeMessage(phoneSocket, message);
  });

  webSocket.send('server: Connection accepted.');
  writeMessage(clientSocket, 'server: Phone connected.');

  phoneSocket.on('close', function() {
    console.log('client websocket connection close')
  });
});

app.get('/', function(request, response) {
  var ip = request.headers['x-forwarded-for'] ||
           request.connection.remoteAddress ||
           request.ip;

  console.log('Client IP:', ip);
  console.log('Server IP:', serverIp);

  var viewLocals = {
    user_ip:   ip,
    server_ip: serverIp
  };
  response.render('index', viewLocals);
});

//
//Start listening
app.listen(serverPort);
console.log('[server] Running web server on: ' + serverPort);

console.log('Sockets:');
console.log('[phone]  Listening on port: ' + phonePort);
console.log('[client] Listening on port: ' + clientPort);
