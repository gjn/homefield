var defs = require('./defs');
var Analyser = require('./analysers');
var Games = require('./games').Games;
var Parsers = require('./parsers');
var Exporter = require('./exporters');

/*
 * Launchers combine parser, analysers and result writers
 */

var Launcher = function () {
    'use strict';

    if (!(this instanceof Launcher)) {
        return new Launcher();
    }

    var games = new Games();
    var parser = new Parsers();
    var type = 'all';

    var getNewAnalyser = function() {
        return new Analyser({alpha: 0.125});
    };

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

    var getFilterFunction = function(seasonref, weekref) {
        return function(game) {
            var gameweek = game.week;

            //Same season
            if (game.season() == seasonref) {
                if (gameweek <= weekref) {
                    return true;
                }
            //All games from previoues season. Always.
            } else if (game.season() == seasonref -1) {
                return true;
            }
            return false; //all others don't fit
        };
    };

    var analyse = function() {
        'use strict';
        var gs = games.games;
        var analyseGames = [];
        var refGame, i, lastweek;
        var MIN_WEEKS = 17
        var exporter = new Exporter();

        games.sortAscending();
        //Filter games according to passed parameters
        if (type == 'all') {
            for (i = 0; i < gs.length; i++) {
                refGame = gs[i];
                if (lastweek != refGame.week) {
                    analyseGames = Games.filter(games.games, getFilterFunction(refGame.season(), refGame.week));
                    if (analyseGames.length >= 256) {
                        exporter.add(getNewAnalyser().analyse(analyseGames));
                    }
                    lastweek = refGame.week;
                }

            }
        } else {
            refGame = gs[gs.length - 1];
            analyseGames = Games.filter(games.games, getFilterFunction(refGame.season(), refGame.week));
            if (analyseGames.length >= 256) {
               exporter.add(getNewAnalyser().analyse(analyseGames));
            }
        }
        exporter.cleanup();
    };

    this.start = function(file, t) {
        'use strict';
        type = t;
        parser.parse(file, addGame, analyse);
    };
};


module.exports = Launcher;

