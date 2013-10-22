var Hapi = require('hapi');
var server = Hapi.createServer('0.0.0.0', parseInt(process.env.PORT || '8000'));

var buildingSize = 5;
var index = 0;
var currentFloor = 0;
var to;
var needToCloseDoor = false;
var openAtFloor = [];
var errors = 0;

var saveOpenRequest = function(floor) {
  if (!shouldOpenAtFloor(floor))
    openAtFloor.push(floor);

  console.log("Save floor " + floor + " -> " + openAtFloor)
}
var removeFloor = function() {
  var index = openAtFloor.indexOf(currentFloor.toString());
  openAtFloor.splice(index, 1);

  console.log("Remove floor " + currentFloor + " -> " + openAtFloor)
}
var shouldOpenAtFloor = function(floor) {
  return openAtFloor.indexOf(floor.toString()) > -1;
}

var goUp = function(request) { currentFloor++; request.reply('UP'); }
var goDown = function(request) { currentFloor--; request.reply('DOWN'); }
var open = function(request) { removeFloor(); needToCloseDoor=true; request.reply('OPEN'); }
var close = function(request) { needToCloseDoor=false; request.reply('CLOSE'); }
var doNothing = function(request) { request.reply('NOTHING'); }

var goTo = function(request) { to.call(this, request); }
var orderTo = function(f) { to = f }

server.route({ method: 'GET', path: '/nextCommand', handler: function (request) {
      console.log("Check floor " + currentFloor + " -> " + openAtFloor + " Index: " + (openAtFloor.indexOf(currentFloor.toString())));

      if (currentFloor === 0) { orderTo(goUp); }
      else if (currentFloor === buildingSize) { orderTo(goDown); }
      else if (openAtFloor.length == 0) { orderTo(doNothing); }
      else if (currentFloor > openAtFloor[0]) { orderTo(goDown);  }
      else if (currentFloor < openAtFloor[0]) { orderTo(goUp);  }

      if (needToCloseDoor) { close(request); }
      else if (shouldOpenAtFloor(currentFloor)) { open(request); }
      else goTo(request);
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
        openAtFloor = [];
        errors++;

        console.log("ERRORS numbers: " + errors + ". Last: " + cause);
        this.reply();
    }
}); 
module.exports = server;
