
var defs = require('./defs').defs;
var games = require('./games').games;

function powerRanking8Games() {
    "use strict";
    var that = {},
        teams = {},
        GAMES_BACK = 8;

    function assureExists(obj, id, creator) {
        if (!obj.hasOwnProperty(id)) {
            obj[id] = creator(id);
        }
    }

    function gamefilter(selectTeam, homeaway, ignoreOpp) {
        return function (game) {
            var stats = [],
                opps = [],
                i,
                j;
            if (!homeaway || homeaway === 'h') {
                stats.push(game.homestat);
                opps.push(game.awaystat.team);
            } else if (!homeaway || homeaway === 'a') {
                stats.push(game.awaystat);
                opps.push(game.homestat.team);
            }
            if (ignoreOpp) {
                for (j = 0; j < opps.length; j += 1) {
                    if (opps[j] === ignoreOpp) {
                        return false;
                    }
                }
            }
            for (i = 0; i < stats.length; i += 1) {
                if (stats[i].team === selectTeam) {
                    return true;
                }
            }
            return false;
        };
    }

    function winloss() {
        var that = {};

        function getwl(game, teamid, w, wl) {
            if (game.homestat.team === teamid) {
                if (game.homestat.pts > game.awaystat.pts) {
                    wl.w += w;
                } else if (game.homestat.pts < game.awaystat.pts) {
                    wl.l += w;
                } else {
                    wl.w += (0.5 * w);
                    wl.l += (0.5 * w);
                }
            } else if (game.awaystat.team === teamid) {
                if (game.homestat.pts < game.awaystat.pts) {
                    wl.w += w;
                } else if (game.homestat.pts > game.awaystat.pts) {
                    wl.l += w;
                } else {
                    wl.w += (0.5 * w);
                    wl.l += (0.5 * w);
                }
            } else {
                console.log('ERROR away and hometeam not found');
            }
        }

        that.addGames = function (teamid, games, weighted) {
            var i = 0,
                w = 1,
                sumw = 0,
                wl = {w: 0, l: 0};

            if (games.length <= 0) {
                return;
            }
            for (i = 0; i < games.length; i += 1) {
                w = weighted ? (games.length - i) : 1;
                sumw += w;
                getwl(games[i], teamid, w, wl);
            }
            sumw /= games.length;
            wl.w /= sumw;
            wl.l /= sumw;

            that.wins += wl.w;
            that.losses += wl.l;

        };
        that.wins = 0;
        that.losses = 0;

        return that;
    }

    function powerResults() {
        var that = {};

        that.expectedwins = 0; //base on opponents winloss record
        that.power = 0; //above (or below) the expected wins
        that.rankew = 0; //rank in league based on expected wins (first has least expected wins = toughest schedule)
        that.rankpower = 0; //rank in league base on poewer (first has most wins above expected wins)

        return that;
    }

    function analyseResult() {
        var that = {};

        that.calculatePowerResults = function (teamid, games, weightowngames, weightoppgames) {
            var i = 0,
                opplosses,
                oppwins,
                totgames;
            //first, let's calculate own win-loss record
            that.hwinloss.addGames(teamid, games.home, weightowngames);
            that.awinloss.addGames(teamid, games.away, weightowngames);
            //now let's calculate opponents winloss record
            for (i = 0; i < games.homeopp.length; i += 1) {
                that.hoppwinloss.addGames(games.homeopp[i].teamid, games.homeopp[i].games, weightoppgames);
            }
            for (i = 0; i < games.awayopp.length; i += 1) {
                that.aoppwinloss.addGames(games.awayopp[i].teamid, games.awayopp[i].games, weightoppgames);
            }

            //get expected wins and power number
            opplosses = that.hoppwinloss.losses + that.aoppwinloss.losses;
            oppwins = that.hoppwinloss.wins + that.aoppwinloss.wins;
            totgames = that.hwinloss.losses + that.hwinloss.wins + that.awinloss.losses + that.awinloss.wins;

            that.powerres.expectedwins = totgames * ((opplosses) / (oppwins + opplosses));
            that.powerres.power = that.hwinloss.wins + that.awinloss.wins - that.powerres.expectedwins;
            //console.log(that.powerres);
        };

        that.hwinloss = winloss(); //own winloss home
        that.hoppwinloss = winloss(); //cumulated winloss of opponents home (which are away games for opponent)
        that.awinloss = winloss(); //own winloss away
        that.aoppwinloss = winloss(); //cumulated winloss of opponents away (which are home games for opponents)
        that.powerres = powerResults();

        return that;
    }

    function analyseGames() {
        var that = {};

        function getOppGames(teamid, ingames, homeaway) {
            var result = [],
                i = 0,
                oppId = '';
            for (i = 0; i < ingames.length; i += 1) {
                if (homeaway === 'h') {
                    oppId = ingames[i].homestat.team;
                } else {
                    oppId = ingames[i].awaystat.team;
                }
                result.push({teamid: oppId,
                             games: games.filterGames(GAMES_BACK, gamefilter(oppId, homeaway, teamid))});
            }
            return result;
        }

        //gets own games and opponents games (excluding the ones against itself)
        that.getAllRelevantGames = function (teamid) {
            that.home = games.filterGames(GAMES_BACK, gamefilter(teamid, 'h', ''));
            that.homeopp = getOppGames(teamid, that.home, 'a');
            that.away = games.filterGames(GAMES_BACK, gamefilter(teamid, 'a', ''));
            that.awayopp = getOppGames(teamid, that.away, 'h');

        };

        that.home = [];
        that.homeopp = [];
        that.away = [];
        that.awayopp = [];

        return that;
    }

    function newteam(id) {
        var that = {};

        function out() {

            function stringForRes(res) {
                return (res.hwinloss.wins + res.awinloss.wins) + ',' + (res.hwinloss.losses + res.awinloss.losses) + ',' +
                       (res.hoppwinloss.wins + res.aoppwinloss.wins) + ',' + (res.hoppwinloss.losses + res.aoppwinloss.losses);
            }

            console.log(that.id +
                        ',' + stringForRes(that.flatres) +
                        ',' + stringForRes(that.weightownres) +
                        ',' + stringForRes(that.weightoppres) +
                        ',' + stringForRes(that.weightboth));
        }

        that.analyse = function () {
            that.games.getAllRelevantGames(that.id);
            that.flatres.calculatePowerResults(that.id, that.games, false, false);
            that.weightownres.calculatePowerResults(that.id, that.games, true, false);
            that.weightoppres.calculatePowerResults(that.id, that.games, false, true);
            that.weightboth.calculatePowerResults(that.id, that.games, true, true);

            //now get a combination
            that.finalres = that.flatres;
        };

        that.id = id;
        that.games = analyseGames();
        that.flatres = analyseResult(); //no weighting done
        that.weightownres = analyseResult(); //own games are weighted.
        that.weightoppres = analyseResult(); //opponents games are weighted.
        that.weightboth = analyseResult(); //both own and opponnents games are weighted. 

        that.finalres = analyseResult(); //can be a combination of both. Used for final ranking

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

        assureExists(teams, ht, newteam);
        assureExists(teams, at, newteam);
    };

    that.analyse = function () {
        var prop,
            teamarray = [],
            i,
            team;

        function getSortFunction(results, sorp) {
            return function (team1, team2) {
                if (team1[results].powerres[sorp] < team2[results].powerres[sorp]) {
                    if (sorp === 'power') {
                        return 1;
                    }
                    return -1;
                }
                if (team1[results].powerres[sorp] > team2[results].powerres[sorp]) {
                    if (sorp === 'power') {
                        return -1;
                    }
                    return 1;
                }
                return 0;
            };
        }

        function applyRanking(teamarray, results, sorp) {
            var i = 0;
            teamarray.sort(getSortFunction(results, sorp));
            for (i = 0; i < teamarray.length; i += 1) {
                if (sorp === 'power') {
                    teamarray[i][results].powerres.rankpower = i + 1;
                } else {
                    teamarray[i][results].powerres.rankew = i + 1;
                }
            }
        }

        function outputHomeAway() {
            console.log('Team hW hL hOW hOL hWW hWL hWOOW hWOOL aW aL aOW aOL aWW aWL aWOOW aWOOL');
            for (i = 0; i < teamarray.length; i += 1) {
                team = teamarray[i];
                console.log(team.id,
                                team.flatres.hwinloss.wins, team.flatres.hwinloss.losses,
                                team.flatres.hoppwinloss.wins, team.flatres.hoppwinloss.losses,
                                team.weightownres.hwinloss.wins, team.weightownres.hwinloss.losses,
                                team.weightoppres.hoppwinloss.wins, team.weightoppres.hoppwinloss.losses,
                                team.flatres.awinloss.wins, team.flatres.awinloss.losses,
                                team.flatres.aoppwinloss.wins, team.flatres.aoppwinloss.losses,
                                team.weightownres.awinloss.wins, team.weightownres.awinloss.losses,
                                team.weightoppres.aoppwinloss.wins, team.weightoppres.aoppwinloss.losses);
            }
        }

        function output() {
            console.log('Team W L OW OL EW P WW WL WEW WP WOOW WOOL WOEW WOP WXEW WXP REW RP RWEW RWP RWOEW RWOP RWXEW RWXP');
            for (i = 0; i < teamarray.length; i += 1) {
                team = teamarray[i];
                console.log(team.id,
                                team.flatres.hwinloss.wins + team.flatres.awinloss.wins, team.flatres.hwinloss.losses + team.flatres.awinloss.losses,
                                team.flatres.hoppwinloss.wins + team.flatres.aoppwinloss.wins, team.flatres.hoppwinloss.losses + team.flatres.aoppwinloss.losses,
                                team.flatres.powerres.expectedwins, team.flatres.powerres.power,
                                team.weightownres.hwinloss.wins + team.weightownres.awinloss.wins, team.weightownres.hwinloss.losses + team.weightownres.awinloss.losses,
                                team.weightownres.powerres.expectedwins, team.weightownres.powerres.power,
                                team.weightoppres.hoppwinloss.wins + team.weightoppres.aoppwinloss.wins, team.weightoppres.hoppwinloss.losses + team.weightoppres.aoppwinloss.losses,
                                team.weightoppres.powerres.expectedwins, team.weightoppres.powerres.power,
                                team.weightboth.powerres.expectedwins, team.weightboth.powerres.power,
                                team.flatres.powerres.rankew, team.flatres.powerres.rankpower,
                                team.weightownres.powerres.rankew, team.weightownres.powerres.rankpower,
                                team.weightoppres.powerres.rankew, team.weightoppres.powerres.rankpower,
                                team.weightboth.powerres.rankew, team.weightboth.powerres.rankpower);
            }
        }

        games.sortGames();

        for (prop in teams) {
            if (teams.hasOwnProperty(prop)) {
                teams[prop].analyse();
                teamarray.push(teams[prop]);
            }
        }

        //determine ranks base on analyse
        applyRanking(teamarray, 'flatres', 'expectedwins');
        applyRanking(teamarray, 'flatres', 'power');
        applyRanking(teamarray, 'weightownres', 'expectedwins');
        applyRanking(teamarray, 'weightownres', 'power');
        applyRanking(teamarray, 'weightoppres', 'expectedwins');
        applyRanking(teamarray, 'weightoppres', 'power');
        applyRanking(teamarray, 'weightboth', 'expectedwins');
        applyRanking(teamarray, 'weightboth', 'power');
        applyRanking(teamarray, 'finalres', 'expectedwins');
        applyRanking(teamarray, 'finalres', 'power');

        outputHomeAway();
    };

    return that;
}

exports.powerranking8games = powerRanking8Games();

