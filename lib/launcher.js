var defs = require('./defs');
var Analyser = require('./analysers');
var Games = require('./games').Games;
var Parsers = require('./parsers');

/*
 * Launchers combine parser, analysers and result writers
 */

var Launcher = function (opt_parser, opt_analyser) {
    'use strict';

    if (!(this instanceof Launcher)) {
        return new Launcher();
    }

    var games = new Games();
    var parser = new Parsers();
    var analyser = new Analyser({HalfLive: 4});

    var addGame = function(date, hometeam, awayteam, week) {
        'use strict';
        var ht = defs.longToShort(hometeam.team),
            at = defs.longToShort(awayteam.team);

        games.addGame({
            week: week,
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

    var analyse = function() {
        'use strict';
        games.sortAscending();
        analyser.analyse(games);
    };

    this.games = new Games();
    this.analyser = new Analyser({HalfLive: 4});

    this.start = function(file) {
        'use strict';
        parser.parse(file, addGame, analyse);
    };
};


module.exports = Launcher;

