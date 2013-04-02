
var defs = require('./defs').defs;
var games = require('./games').games;

function powerRankingFlat() {
    "use strict";
    var that = {},
        teams = {};

    function createWLStats() {
        var that = {};

        that.addStats = function (game, win, loss, opp) {
            that.games.push(game);
            that.wins += win;
            that.losses += loss;
            that.opps.push(opp);
        };

        that.games = [];
        that.wins = 0;
        that.losses = 0;
        that.opps = [];
        that.expectedwins = 0;
        that.power = 0;

        return that;
    }

    that.gameCallback = function (date, hometeam, awayteam) {
        var ht = defs.longToShort(hometeam.team),
            at = defs.longToShort(awayteam.team),
            game;

        game = games.addGame(date,
                                 ht,
                                 hometeam.pts,
                                 hometeam.yds,
                                 hometeam.to,
                                 at,
                                 awayteam.pts,
                                 awayteam.yds,
                                 awayteam.to);

        function assureExists(team) {
            if (!teams.hasOwnProperty(team)) {
                teams[team] = that.team(team);
            }
        }

        assureExists(ht);
        assureExists(at);

        teams[ht].addGame(game);
        teams[at].addGame(game);
    };

    that.team = function (id) {
        var that = {};

        that.addGame = function (game) {
            var opp = '', win = 0, loss = 0, tie = 0, homeaway;
            if (game.homestat.team === that.id) {
                homeaway = that.homegames;
                opp = game.awaystat.team;
                if (game.homestat.pts > game.awaystat.pts) {
                    win += 1;
                } else if (game.homestat.pts < game.awaystat.pts) {
                    loss += 1;
                } else {
                    win += 0.5;
                    loss += 0.5;
                }
            } else if (game.awaystat.team === that.id) {
                opp = game.homestat.team;
                homeaway = that.awaygames;
                if (game.homestat.pts < game.awaystat.pts) {
                    win += 1;
                } else if (game.homestat.pts > game.awaystat.pts) {
                    loss += 1;
                } else {
                    win += 0.5;
                    loss += 0.5;
                    //console.log("found tie");
                }
            } else {
                console.log('ERROR away and hometeam not found');
            }
            that.allgames.addStats(game, win, loss, opp);
            homeaway.addStats(game, win, loss, opp);
        };

        that.output = function (teams) {
            var i = 0, oppwins = 0, opplosses = 0, sum = 0;
            for (i = 0; i < that.allgames.opps.length; i += 1) {
                oppwins += teams[that.allgames.opps[i]].allgames.wins;
                opplosses += teams[that.allgames.opps[i]].allgames.losses;
            }
            oppwins -= that.allgames.losses;
            opplosses -= that.allgames.wins;
            sum = that.allgames.wins + that.allgames.losses;
            that.allgames.expectedwins = (opplosses / (opplosses + oppwins)) * sum;
            that.allgames.power = that.allgames.wins - that.allgames.expectedwins;

            oppwins = 0;
            opplosses = 0;
            for (i = 0; i < that.homegames.opps.length; i += 1) {
                oppwins += teams[that.homegames.opps[i]].awaygames.wins;
                opplosses += teams[that.homegames.opps[i]].awaygames.losses;
            }
            oppwins -= that.homegames.losses;
            opplosses -= that.homegames.wins;
            sum = that.homegames.wins + that.homegames.losses;
            that.homegames.expectedwins = (opplosses / (opplosses + oppwins)) * sum;
            that.homegames.power = that.homegames.wins - that.homegames.expectedwins;

            oppwins = 0;
            opplosses = 0;
            for (i = 0; i < that.awaygames.opps.length; i += 1) {
                oppwins += teams[that.awaygames.opps[i]].homegames.wins;
                opplosses += teams[that.awaygames.opps[i]].homegames.losses;
            }
            oppwins -= that.awaygames.losses;
            opplosses -= that.awaygames.wins;
            sum = that.awaygames.wins + that.awaygames.losses;
            that.awaygames.expectedwins = (opplosses / (opplosses + oppwins)) * sum;
            that.awaygames.power = that.awaygames.wins - that.awaygames.expectedwins;

            that.combinedexpectedwins = that.homegames.expectedwins + that.awaygames.expectedwins;
            that.combinedpower = that.homegames.power + that.awaygames.power;

        };

        that.id = id;
        that.allgames = createWLStats();
        that.homegames = createWLStats();
        that.awaygames = createWLStats();
        that.combinedexpectedwins = 0;
        that.combinedpower = 0;
        that.schedulerank = 0;
        return that;
    };

    that.analyse = function () {
        var prop,
            teamarray = [],
            i = 0,
            t;

        function powersort(team1, team2) {
            if (team1.combinedpower < team2.combinedpower) {
                return 1;
            }
            if (team1.combinedpower > team2.combinedpower) {
                return -1;
            }
            return 0;
        }

        function schedulesort(team1, team2) {
            if (team1.combinedexpectedwins < team2.combinedexpectedwins) {
                return -1;
            }
            if (team1.combinedexpectedwins > team2.combinedexpectedwins) {
                return 1;
            }
            return 0;
        }

        for (prop in teams) {
            if (teams.hasOwnProperty(prop)) {
                teams[prop].output(teams);
                teamarray.push(teams[prop]);
            }
        }

        teamarray.sort(schedulesort);
        for (i = 0; i < teamarray.length; i += 1) {
            t = teamarray[i];
            t.schedulerank = i + 1;
        }

        teamarray.sort(powersort);
        for (i = 0; i < teamarray.length; i += 1) {
            t = teamarray[i];
            console.log((i + 1) + ') ' + t.id + ' ' + t.combinedpower.toFixed(1) + ' {' + t.schedulerank + '} (' + t.allgames.wins + '-' + t.allgames.losses + ')');
        }

    };

    return that;
}

exports.powerrankingflat = powerRankingFlat();

