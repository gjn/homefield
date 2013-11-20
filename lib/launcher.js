var defs = require('./defs');
var Analyser = require('./analysers');
var Games = require('./games').Games;

/*
 * Combines parser of statis with analyser to be used
 *
 */

var Launcher = function () {
    'use strict';

    if (!(this instanceof Launcher)) {
        return new Launcher();
    }

    this.games = new Games();
    //here we can add different analysers, based on parameters passed
    //this.analyser = new Analyser({HalfLive: 8});
    //this.analyser = new Analyser({HalfLive: 4});
    this.analyser = new Analyser({alpha: 0.1});
};

Launcher.prototype.addGame = function(date, hometeam, awayteam) {
    'use strict';
    var ht = defs.longToShort(hometeam.team),
        at = defs.longToShort(awayteam.team);

    this.games.addGame({
        date: date,
        hometeam: ht,
        homepts: hometeam.pts,
        homeyards: hometeam.yds,
        hometo: hometeam.to,
        awayteam: at,
        awaypts: awayteam.pts,
        awayyards: awayteam.yds,
        awayto: awayteam.to
    });
};

Launcher.prototype.analyse = function () {
    'use strict';
    this.games.sortAscending();
    if (this.analyser) {
        this.analyser.analyse(this.games);
    } else {
        this.games.outputGames();
    }
};


module.exports = Launcher;

