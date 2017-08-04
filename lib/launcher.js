var defs = require('./defs');
// Get current ranges (min/max, etc) for given games
var Analyser = require('./analysers');
var Predictor = require('./predictors');
var StrengthOfSchedule = require('./schedule');
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
    var season;

    var getNewAnalyser = function() {
        return new Analyser({alpha: 0.25});
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

    var isLater = function(gameRef, candidate) {
      if (candidate.season() > gameRef.season()) {
        return true;
      } else if (candidate.season() < gameRef.season()) {
        return false;
      } else if (candidate.week > gameRef.week) {
        return true;
      }
      return false;
    }

    var getFilterFunction = function(seasonref, weekref) {
        return function(game) {
            var gameweek = game.week;
            
            // Filter out games that are not played yet
            if (isNaN(game.homestat.pts)) {
              return false;
            }

            //Same season
            if (game.season() == seasonref) {
                if (gameweek <= weekref) {
                    return true;
                }
            } else if (game.season() == seasonref -1) {
                return true;
            } else if (game.season() == seasonref -2) {
                return true;
            } else if (game.season() == seasonref - 3) {
                if (gameweek > weekref) {
                    return true;
                }
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
        var exporter = new Exporter({overlap: true});
        //var allexporter = new Exporter({splitlogic: 'all'});
        var res;

        games.sortAscending();
        var predictor = new Predictor();
        var SOS = new StrengthOfSchedule();
        var SOSPlayed;
        
        for (var i = 0; i < gs.length; i++) {
          refGame = gs[i];
          if (refGame.week != lastweek &&
              ((refGame.season() == season) ||
               (refGame.season() == season - 1 && refGame.week == 21))) {
            analyseGames = Games.filter(games.games, getFilterFunction(refGame.season(), refGame.week));
            var lastPlayedGame = analyseGames[analyseGames.length - 1];
            if (analyseGames.length >= 256 &&
                !isLater(lastPlayedGame, refGame)) {
             
               if (res) {  
                 SOSPlayed = SOS.playedSchedule(res, refGame.season(), refGame.week, games.games);
               }

               res = getNewAnalyser().analyse(analyseGames);
               res.predictions = predictor.newWeek(analyseGames, res, games.games);
               res.SOS = SOS.remainingSchedule(res, refGame.season(), refGame.week, games.games);
               res.SOSPlayed = SOSPlayed;

               exporter.add(res);
               
               //allexporter.add(res, games.games);
            }
            lastweek = refGame.week;
          }
        }
        exporter.cleanup(season, games.games);
        //allexporter.cleanup(season, games.games);
    };

    this.start = function(path, seas) {
        'use strict'
        season = parseInt(seas, 10);
        var ss = season - 3;
        if (ss < 2002) {
          ss = 2002;
        }
        for (; ss < season; ss++) {
          parser.parse(path + ss + '.csv', addGame, function() {});
        }
        parser.parse(path + season + '.csv', addGame, analyse);
    };
};


module.exports = Launcher;

