var _ = require('underscore');
var ts = require('./teamstat');
var fs = require('fs');
var util = require('util');
var stringify = require('json-stringify-safe');

var ExponentialMovingAverageAnalyser = function (o) {
    'use strict';

    if (!(this instanceof ExponentialMovingAverageAnalyser)) {
        return new ExponentialMovingAverageAnalyser(o);
    }

    var options = o || {},
        hl = 4,
        N = 0;
    if (_.isNumber(options.alpha)) {
        this.alpha = options.alpha;
    } else {
        if (_.isNumber(options.N)) {
            N = options.N;
        } else {
            if (_.isNumber(options.HalfLive)) {
                hl = options.HalfLive;
            }
            N = hl * 2.8854;
        }
        this.alpha = (2 / (N + 1));
    }
    this.N = (2 - this.alpha) / this.alpha;
    this.hl = this.N / 2.8854;

    this.averages = {
        all: {},
        home: {},
        away: {}
    }; //avarage stats of games (all, home and away)
    this.teamstats = {
        overall: {}, //contains running count of all games stats based on home/away analysis
        home: {}, //contains only home games stats
        away: {} //contains only away games stats
    };
    this.games = null; //reference to all games
};

ExponentialMovingAverageAnalyser.prototype.analyse = function(games) {
    'use strict';
    this.games = games;
    this.calculateAverages();
    _.each(this.games, this.analyseGame, this);

    this.calculateRankings();

    return this;
};

ExponentialMovingAverageAnalyser.prototype.calculateRankings = function() {
    'use strict';
    var types = ['overall', 'home', 'away'];

    var sort = function(ts, oppornot, offordef, key) {
        var augmented = _.clone(ts);
        _.each(augmented, function(teamstat, team) {
           augmented[team]['team'] = team;
	});
        var sorted = _.sortBy(augmented, function(teamstat, team) {
            return teamstat[oppornot][offordef][key];
        });
        return sorted;
    };

    var adaptRank = function(key, offordef, rank) {
        var r = rank + 1;
        if (key === 'winloss' ||
            key === 'yards' ||
            key === 'pts') {
            r = 33 - r;
        }
        if (offordef === 'def') {
            r = 33 -r;
        }
        return r;
    }; 

    var rank = function(ts) {
        var teamstat = ts['MIN'];
        _.each(teamstat, function(stat, oppornot){ 
            _.each(stat, function(s, offordef) {
                _.each(s, function(sortStat, key) {
                    if (_.isNumber(teamstat[oppornot][offordef][key])) {
                        var sortedTs = sort(ts, oppornot, offordef, key);
                        _.each(sortedTs, function(teams, rank) {
                            ts[teams.team][oppornot][offordef]['rankOf' + key] = adaptRank(key, offordef, rank);
                        });
                    }
                });
            });
        });
    };
    var that = this;
    _.each(types, function(type) {
        rank(that.getTeamStats(type));
    });
};

ExponentialMovingAverageAnalyser.prototype.calculateAverages = function () {
    'use strict';
    var temp = {
        all: {},
	      home: {},
      	away: {}
    };
    var averages = this.averages;
    var get = function(type, key) {
        if (!temp[type][key]) {
            temp[type][key] = [];
        }
        return temp[type][key];
    };
    //create array of stats
    _.each(this.games, function (game) {
        _.each(game.homestat, function (value, key) {
            if (_.isNumber(value)) {
                get('all', key).push(value);
                get('home', key).push(value);
            }
        });
        _.each(game.awaystat, function (value, key) {
            if (_.isNumber(value)) {
                get('all', key).push(value);
                get('away', key).push(value);
            }
        });
    });
    //calculate averages
    _.each(temp, function(statsarray, type) {
        _.each(statsarray, function (value, key) {
            var count = 0;
            var sum = _.reduce(value, function (memo, val) {
                count += 1;
                return memo+val;
            }, 0);
            averages[type][key] = sum/count;
        });
    });
};

var ema = function(newvalue, alpha, oldema) {
    'use strict';
    if (!_.isNumber(oldema)) {
        throw new Error('make sure that stats are initialised');
    }
    return (alpha * newvalue) + ((1 - alpha) * oldema);
};

/*
 * Get new values according to strategy.
 * - gamestats and oppgamestats contain stats for game (TeamStat)
 * - emas contain current emas of team (TeamOffDefStat)
 * - oppemas contain current emas of opposing team (TeamOffDefStat)
 * - returns new values as TeamOffDefStat
 */
var getNewValues = function(gamestats, oppgamestats, oppemas, emas) {
    'use strict';
    var results = new ts.TeamWithOppStat(),
        get = null;

    get = function(g, rating, opprating, r, ropp) {
        _.each(g, function(value, key) {
            if (_.isNumber(value)) {
                if (!_.isNumber(opprating[key]) ||
                    !_.isNumber(rating[key])) {
                    throw new Error('make sure that stats are initialised');
                } else {
                    r[key] = rating[key] + value - ((opprating[key] + rating[key]) / 2.0);
                    ropp[key] = opprating[key];
                }
            }
        });
    };
    get(gamestats, emas.off, oppemas.def, results.stat.off, results.oppstat.def);
    get(oppgamestats, emas.def, oppemas.off, results.stat.def, results.oppstat.off);
    return results;
};

var applyNewValues = function(newvalues, stats, alpha) {
    'use strict';
    var apply = function(n, stat) {
        _.each(n, function(value, key) {
            if (_.isNumber(value)) {
                stat[key] = ema(value, alpha, stat[key]);
            }
        });
    };
    apply(newvalues.stat.off, stats.stat.off);
    apply(newvalues.stat.def, stats.stat.def);
    apply(newvalues.oppstat.off, stats.oppstat.off);
    apply(newvalues.oppstat.def, stats.oppstat.def);
};

/* The algorithm in a nutshell
 * - Each team keeps an exponential, weighted average of each statistic (offensive and
 *   defensive), called EMAOff and EMADef. EMAOff and EMADeff can be interpreted as the
 *   strenght of the team for the given statistic.
 * - Each team keeps an exponential, weighted average of each statistic (offensive and
 *   defensive) of opposing teams, called EMAOppOff and EMAOppDef. This can be interpreted
 *   as the strenght of schedule statistic of each team.
 * - Each EMA is initialised to BASE. Base corresponds to league average of given stat.
 * - To update a given EMAOff/EMAOppDef, the following is done:
 *          ema: function to update ema value. Parameter corresponds to new value to add
 *          EMAOppDef: ema(EMADef of opposing team)
 *          EMAOff: ema(EMAOff + (Off - (EMADef of opposing team))). We have expected value
 *          corresponding to EMADef of opposing team and actual statistic of the game as Off.
 *          The difference is added to the current EMAOff value, which is then addded as new
 *          value to ema. If Off exceeds EMADef of opposing team, the newvalue will be bigger
 *          than current EMAOff and vice versa.
 * - To update a given EMADef/EMAOppOff, the same is done, only reversing off and def
 * - For each game, the update is atomic, meaning that both teams are updated at the same
 *   time, using the EMA values that were valid prior to the game.
 *
 */

ExponentialMovingAverageAnalyser.prototype.analyseGame = function(game) {
    'use strict';

    var calculate = function(homestat, awaystat, ht, at, allht, allat, alpha) {
        var htNew = getNewValues(homestat, awaystat, at.stat, ht.stat);
        var atNew = getNewValues(awaystat, homestat, ht.stat, at.stat);
        applyNewValues(htNew, ht, alpha);
        applyNewValues(atNew, at, alpha);
        applyNewValues(htNew, allht, alpha);
        applyNewValues(atNew, allat, alpha);
    };
    
    var hstat;
    if (game.week == 21) {
      // For superbowls, we treat both teams as away teams
      hstat = this.getTeamStats('away', game.hometeam);
    } else {
      hstat = this.getTeamStats('home', game.hometeam);
    }
    var astat = this.getTeamStats('away', game.awayteam);
    var allhstat = this.getTeamStats('overall', game.hometeam);
    var allastat = this.getTeamStats('overall', game.awayteam);
    calculate(game.homestat, game.awaystat, hstat, astat, allhstat, allastat, this.alpha);
};

ExponentialMovingAverageAnalyser.prototype.getTeamStats = function(collection, teamid) {
    'use strict';
    var invert = function(coll) {
        if (coll === 'home') {
            return 'away';
        } else if (coll === 'away') {
            return 'home';
        }
        return 'all';
    };

    var norm = function(coll) {
        if (coll === 'overall') { 
            return 'all';
        }
        return coll;
    };

    if (!_.isString(collection)) {
        collection = 'all';
    }
    if (_.isString(teamid)) {
        //first assure that it exists
        if (!_.has(this.teamstats[collection], teamid)) {
            this.teamstats[collection][teamid] = new ts.TeamWithOppStat({
                off: new ts.TeamStat(this.averages[norm(collection)]),
                def: new ts.TeamStat(this.averages[invert(collection)])
            }, {
                off: new ts.TeamStat(this.averages[invert(collection)]),
                def: new ts.TeamStat(this.averages[norm(collection)])
            });
        }
        return this.teamstats[collection][teamid];
    } else {
        return this.teamstats[collection];
    }
};

ExponentialMovingAverageAnalyser.prototype.exportCSV = function(filename) {
    'use strict';
    var that = this;

    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    }

    var getStringForStat = function (stat) {
        var ret = '';
        _.each(stat, function (value) {
            if (_.isNumber(value)) {
                ret += (',' + value);
            }
        });
        return ret;
    };

    var getHeaderForStat = function (stat, prefix) {
        var ret = '';
        _.each(stat, function (value, key) {
            if (_.isNumber(value)) {
                ret += (',' + prefix + key);
            }
        });
        return ret;
    };

    var stream = fs.createWriteStream(filename);
    var writeAverage = function(stream, avgs, type) {
        //write averages
        stream.write(type + ' Averages:\n');
        _.each(avgs[type], function (value, key) {
            stream.write(key + ' = ' + value + '\n');
        });
    };
    writeAverage(stream, this.averages, 'overall');
    writeAverage(stream, this.averages, 'home');
    writeAverage(stream, this.averages, 'away');

    //write analyser info
    stream.write('EMA Analyser with alpha = ' + this.alpha + ' (N = ' + this.N + ', hl = ' + this.hl + ')\n');
    stream.write('Number of games: ' + this.games.length + '\n');

    var writeSection = function (collection, title) {
        //write header
        var dummy = that.getTeamStats(collection, 'MIN').stat.off;
        stream.write('-----------------------------------------------------------------------------------------------------\n');
        stream.write(title + '\n');
        stream.write('team' +
                    getHeaderForStat(dummy, 'off.') +
                    getHeaderForStat(dummy, 'def.') +
                    getHeaderForStat(dummy, 'oppoff.') +
                    getHeaderForStat(dummy, 'oppdef.') +
                    '\n');

        _.each(that.getTeamStats(collection), function (value, key) {
            stream.write(key +
                        getStringForStat(value.stat.off) +
                        getStringForStat(value.stat.def) +
                        getStringForStat(value.oppstat.off) +
                        getStringForStat(value.oppstat.def) +
                        '\n');
        });
    };

    writeSection('overall', 'ALL GAMES');
    writeSection('home', 'HOME GAMES ONLY');
    writeSection('away', 'AWAY GAMES ONLY');

    stream.end();
    console.log('results written to', filename);
};

module.exports = ExponentialMovingAverageAnalyser;

