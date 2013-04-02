
var defs = require('./defs').defs;

function gamesModule() {
    "use strict";
    var that = {},
        games = [];

    function gameSeason(season, type, week) {
        var that = {};

        that.season = season; //year e.g. '2012' for 2012 season
        that.type = type; //'ps' for pre-season, 'rs' for regular season, 'po' for playoffs
        that.week = week; //for 'ps' and 'rs': 1...16. For 'po': 'wc' for wildcard round, 'dr' for divisional round, 'c' for championship games and 'sb' for superbowls
    }


    function gameStat(team, pts, yards, to) {
        var that = {};

        that.team = team;
        that.pts = parseInt(pts, 10);
        that.yards = parseInt(yards, 10);
        that.to = parseInt(to, 10);

        return that;
    }

    function game(date, homestat, awaystat) {
        var that = {};

        that.date = date;
        that.homestat = homestat;
        that.awaystat = awaystat;

        return that;
    }

    //descending based on date
    function gamesort(game1, game2) {
        if (game1.date > game2.date) {
            return -1;
        }
        if (game1.date < game2.date) {
            return 1;
        }
        return 0;
    }

    //based on date, will give back season (year), type (ps, s, po), week (1...16, wc, dr, c, sb)
    function dateToSeason(date) {

    }

    that.addGame = function (date, hometeam, homepts, homeyards, hometo, awayteam, awaypts, awayyards, awayto, gamesarray) {
        var homestat = gameStat(hometeam, homepts, homeyards, hometo),
            awaystat = gameStat(awayteam, awaypts, awayyards, awayto),
            gamesToAdd = gamesarray || games,
            gameToAdd = 0;

        gameToAdd = game(date, homestat, awaystat);
        gamesToAdd.push(gameToAdd);
        return gameToAdd;
    };

    //most recent first
    that.sortGames = function (gamesarray, sortfunction) {
        var gamesToSort = gamesarray || games,
            gs = sortfunction || gamesort;
        gamesToSort.sort(gs);
    };

    //return true in filterfunc if you want to include it
    //maxres to specify the maximum number of results. 0 (or smaller) results in all possible results
    that.filterGames = function (maxres, filterfunc, gamesarray) {
        var i = 0,
            results = [],
            gamesToFilter = gamesarray || games;
        for (i = 0; i < gamesToFilter.length; i += 1) {
            if (filterfunc(gamesToFilter[i])) {
                results.push(gamesToFilter[i]);
                if (maxres > 0 && results.length >= maxres) {
                    break;
                }
            }
        }
        return results;
    };

    that.outputGames = function (gamearray) {
        console.log(gamearray || games);
    };

    return that;
}

exports.games = gamesModule();

