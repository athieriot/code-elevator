var Hapi = require('hapi');
var server = Hapi.createServer('localhost', parseInt(process.env.PORT) || 8000);

buildingSize = 5;
var index = 0;
var currentFloor = 0;
var to;
var needToCloseDoor = false;
var openAtFloor = [];

var saveOpenRequest = function(floor) {
  if (!shouldOpenAtFloor(floor))
    openAtFloor.push(floor);
  console.log("Save floor " + floor + " -> " + openAtFloor)
}
var removeFloor = function() {
  var index = openAtFloor.indexOf(currentFloor.toString());
  console.log("Index: " + index);
  openAtFloor.splice(index, 1);
  console.log("Remove floor " + currentFloor + " -> " + openAtFloor)
}
var shouldOpenAtFloor = function(floor) {
  return openAtFloor.indexOf(floor.toString()) > -1;
}

var goUp = function(request) {
  currentFloor = currentFloor + 1;
  to = goUp
  request.reply('UP');
}
var goDown = function(request) {
  currentFloor = currentFloor - 1;
  to = goDown
  request.reply('DOWN');
}
var open = function(request) {
  removeFloor();
  needToCloseDoor=true;
  request.reply('OPEN');
}
var close = function(request) {
  needToCloseDoor=false;
  request.reply('CLOSE');
}
var doNothing = function(request) {
  request.reply('NOTHING');
}
var goTo = function(request) {
  to.call(this, request);
}

server.route({ method: 'GET', path: '/nextCommand', handler: function (request) {
      console.log("Check floor " + currentFloor + " -> " + openAtFloor + " Index: " + (openAtFloor.indexOf(currentFloor.toString())));
      if (needToCloseDoor) { close(request); }
      else if (shouldOpenAtFloor(currentFloor)) { open(request); }
      else if (currentFloor == 0) { goUp(request); }
      else if (currentFloor == buildingSize) { goDown(request); }
      else { goTo(request); }
    }
});

server.route({ method: 'GET', path: '/call', handler: function (request) {
        var atFloor = request.query.atFloor;
        var to = request.query.to;

        saveOpenRequest(atFloor);

        this.reply();
    }
});

server.route({ method: 'GET', path: '/go', handler: function (request) {
        var floorToGo = request.query.floorToGo;

        saveOpenRequest(floorToGo);

        this.reply();
    }
});

server.route({ method: 'GET', path: '/userHasEntered', handler: function (request) {
        needToCloseDoor = true;

        this.reply();
    }
});

server.route({ method: 'GET', path: '/userHasExited', handler: function (request) {
        needToCloseDoor = true;

        this.reply();
    }
});

server.route({ method: 'GET', path: '/reset', handler: function (request) {
        var cause = request.query.cause;

        currentFloor = 0;
        needToCloseDoor = false;

        this.reply();
    }
}); 
module.exports = server;
