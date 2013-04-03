
var TeamStat = require('./teamstat').TeamStat;

var Game = function (o) {
    'use strict';

    if (!(this instanceof Game)) {
        return new Game(o);
    }

    var opts = o || {};

    //date of the game
    this.date = opts.date;
    //home team
    this.hometeam = opts.hometeam;
    //team statistics
    this.homestat = opts.homestat;
    //away team
    this.awayteam = opts.awayteam;
    //opponent team statistics
    this.awaystat = opts.awaystat;
};

var Games = function () {
    'use strict';
    if (!(this instanceof Games)) {
        return new Games();
    }

    this.games = [];

};

var gamesortByDate = function(asc) {
    'use strict';
    return function(game1, game2) {
        if (asc) {
            if (game1.date < game2.date) {
                return -1;
            } else if (game1.date > game2.date) {
                return 1;
            }
        } else {
            if (game1.date > game2.date) {
                return -1;
            } else if (game1.date < game2.date) {
                return 1;
            }
        }
        return 0;
    };
};

var getwinloss = function (pro, con) {
    'use strict';
    if (pro > con) {
        return 1.0;
    } else if (con > pro) {
        return 0.0;
    } else {
        return 0.5;
    }
};

//static function
Games.addGame = function (o, gamesarray) {
    'use strict';
    var gameToAdd = null,
        homestat = new TeamStat({
            winloss: getwinloss(o.homepts, o.awaypts),
            pts: o.homepts,
            yards: o.homeyards,
            to: o.hometo
        }),
        awaystat = new TeamStat({
            winloss: 1.0 - homestat.winloss,
            pts: o.awaypts,
            yards: o.awayyards,
            to: o.awayto
        });

    gameToAdd = new Game({
        date: o.date,
        hometeam: o.hometeam,
        homestat: homestat,
        awayteam: o.awayteam,
        awaystat: awaystat
    });
    gamesarray.push(gameToAdd);
    return gameToAdd;
};

//static function
Games.sort = function (gamesarray, sortfunction) {
    'use strict';
    var gs = sortfunction || gamesortByDate(true);
    gamesarray.sort(gs);
};

//static function
Games.filter = function (gamesarray, filterfunc, maxres) {
    'use strict';
    var i = 0,
        results = [],
        mr = maxres || 0;
    for (i = 0; i < gamesarray.length; i += 1) {
        if (filterfunc(gamesarray[i])) {
            results.push(gamesarray[i]);
            if (mr > 0 && results.length >= mr) {
                break;
            }
        }
    }
    return results;
};

//static function
Games.outputGames = function (gamesarray) {
    'use strict';
    console.log(gamesarray);
};

Games.prototype.addGame = function (o) {
    'use strict';
    return Games.addGame(o, this.games);
};

Games.prototype.sort = function (sortfunction) {
    'use strict';
    Games.sort(this.games, sortfunction);
};

Games.prototype.sortAscending = function () {
    'use strict';
    Games.sort(this.games, gamesortByDate(true));
};

Games.prototype.sortDescending = function () {
    'use strict';
    Games.sort(this.games, gamesortByDate(false));
};

Games.prototype.filter = function (filterfunc, maxres) {
    'use strict';
    return Games.filter(this.games, filterfunc, maxres);
};

Games.prototype.outputGames = function () {
    'use strict';
    Games.outputGames(this.games);
};

module.exports = {
    Game: Game,
    Games: Games
};

