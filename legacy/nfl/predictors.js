
var defs = require('./defs').defs;
var G = require('./games').games;

//takes all games with callback and guesses each game with simple win/loss records
//of both teams. Considers only home record or only away record of given team. If
//both these records are equal, then home team is shown as winner
function simpleSeasonPredictor() {
    "use strict";
    var that = {},
        mygames = [],
        weeklypredictions = [];

    function predictionRecord() {
        var that = {};
        that.w = 0;
        that.l = 0;
        return that;
    }

    function sortGamesAscending(game1, game2) {
        if (game1.date > game2.date) {
            return 1;
        }
        if (game1.date < game2.date) {
            return -1;
        }
        return 0;
    }

    function gameFilterHometeam(ht, date) {
        return function (game) {
            if (game.homestat.team === ht &&
                    game.date < date) {
                return true;
            }
            return false;
        };
    }

    function gameFilterAwayteam(at, date) {
        return function (game) {
            if (game.awaystat.team === at &&
                    game.date < date) {
                return true;
            }
            return false;
        };
    }

    function getWinRate(games, team) {
        var i = 0, game, w = 0, l = 0, ret = 0;

        for (i = 0; i < games.length; i += 1) {
            game = games[i];
            if ((game.homestat.team === team && game.homestat.pts > game.awaystat.pts) ||
                    (game.awaystat.team === team && game.awaystat.pts > game.homestat.pts)) {
                w += 1;
            } else if ((game.homestat.team === team && game.homestat.pts < game.awaystat.pts) ||
                    (game.awaystat.team === team && game.awaystat.pts < game.homestat.pts)) {
                l += 1;
            } else {
                w += 0.5;
                l += 0.5;
            }
        }
        if ((w + l) > 0) {
            ret = (w / (w + l));
        }
        return ret;
    }


    that.gameCallback = function (date, hometeam, awayteam) {
        var ht = defs.longToShort(hometeam.team),
            at = defs.longToShort(awayteam.team);

        G.addGame(date,
                          ht,
                          hometeam.pts,
                          hometeam.yds,
                          hometeam.to,
                          at,
                          awayteam.pts,
                          awayteam.yds,
                          awayteam.to,
                          mygames);
    };

    that.analyse = function () {
        var i = 0, right = 0, wrong = 0, pasthometeamgames, pastawayteamgames, r = 0, w = 0,
            game;
        G.sortGames(mygames, sortGamesAscending);

        //go through all games and predict outcome, then compare to result.
        //NOTE: looks up past for each game. so this might be slow
        for (i = 0; i < mygames.length; i += 1) {
            game = mygames[i];
            pasthometeamgames = G.filterGames(8, gameFilterHometeam(game.homestat.team, game.date), mygames);
            pastawayteamgames = G.filterGames(8, gameFilterAwayteam(game.awaystat.team, game.date), mygames);
            if (getWinRate(pasthometeamgames, game.homestat.team) >
                    getWinRate(pastawayteamgames, game.awaystat.team)) {
                if (game.homestat.pts > game.awaystat.pts) {
                    right += 1;
                    r += 1;
                } else {
                    wrong += 1;
                    w += 1;
                }

            } else if (getWinRate(pasthometeamgames, game.homestat.team) <
                    getWinRate(pastawayteamgames, game.awaystat.team)) {
                if (game.homestat.pts < game.awaystat.pts) {
                    right += 1;
                    r += 1;
                } else {
                    wrong += 1;
                    w += 1;
                }
            } else {
                if (game.homestat.pts > game.awaystat.pts) {
                    right += 1;
                    r += 1;
                } else {
                    wrong += 1;
                    w += 1;
                }
            }
            if (i%15 === 0 && i !== 0) {
                console.log(r + ' - ' + w);
                r = 0;
                w = 0;
            }
        }
        console.log(right, '-', wrong, '(', right / (right / wrong), ')');

    };

    return that;
}

function predictors() {
    "use strict";
    var that = {};

    that.simplePredictor = simpleSeasonPredictor();

    return that;
}

exports.predictors = predictors();

