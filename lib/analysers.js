var _ = require('underscore');
var ts = require('./teamstat');
var fs = require('fs');

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

    this.prediction = {
        wl: {right: 0, wrong: 0},
        pts: {right: 0, wrong: 0}
    };

    this.avgs = {}; //avarage stats of all games
    this.teamstats = {
        all: {}, //contains all games stats
        home: {}, //contains only home games stats
        away: {}, //contains only away games stats
        aggregate: {} //contains an average of home and away
    };
    this.games = null; //reference to all games
};

ExponentialMovingAverageAnalyser.prototype.analyse = function(games) {
    'use strict';
    this.games = games.games;
    this.calculateAverages();
    console.log('EMA analyser with Alpha set to:', this.alpha);
    _.each(this.games, this.analyseGame, this);
    this.exportCSV();

    console.log(this.prediction.wl.right + this.prediction.wl.wrong);
    console.log(this.prediction.wl.right / (this.prediction.wl.right + this.prediction.wl.wrong));
    console.log(this.prediction.pts.right + this.prediction.pts.wrong);
    console.log(this.prediction.pts.right / (this.prediction.pts.right + this.prediction.pts.wrong));
};

ExponentialMovingAverageAnalyser.prototype.calculateAverages = function () {
    'use strict';
    var temp = {};
    var avgs = this.avgs;
    //create array of stats
    _.each(this.games, function (game) {
        _.each(game.homestat, function (value, key) {
            if (_.isNumber(value)) {
                if (!temp[key]) {
                    temp[key] = [];
                }
                temp[key].push(value);
            }
        });
        _.each(game.awaystat, function (value, key) {
            if (_.isNumber(value)) {
                if (!temp[key]) {
                    temp[key] = [];
                }
                temp[key].push(value);
            }
        });
    });
    //calculate averages
    _.each(temp, function (value, key) {
        var count = 0;
        var sum = _.reduce(value, function (memo, val) {
            count += 1;
            return memo+val;
        }, 0);
        avgs[key] = sum/count;
    });
    console.log(this.avgs);
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
var getNewValues = function(gamestats, oppgamestats, emas, oppemas, bases) {
    'use strict';
    var results = new ts.TeamWithOppStat(),
        get = null;

    get = function(g, e, o, r, ropp) {
        var oldema, expectedValue;
        _.each(g, function(value, key) {
            oldema = e[key];
            expectedValue = o[key];
            if (_.isNumber(value)) {
                if (!_.isNumber(oldema) ||
                    !_.isNumber(expectedValue) ||
                    !_.isNumber(bases[key])) {
                    throw new Error('make sure that stats are initialised');
                } else {
                    r[key] = bases[key] + value - expectedValue;
                    ropp[key] = expectedValue;
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
 *          EMAOff: ema(BASE + (Off - (EMADef of opposing team))). We have expected value
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

    var calculate = function(homestat, awaystat, ht, at, avgs, alpha) {
        var htNew = getNewValues(homestat, awaystat, ht.stat, at.stat, avgs);
        var atNew = getNewValues(awaystat, homestat, at.stat, ht.stat, avgs);
        applyNewValues(htNew, ht, alpha);
        applyNewValues(atNew, at, alpha);
    };

    //doing all games
    var hstat = this.getTeamStats('all', game.hometeam);
    var astat = this.getTeamStats('all', game.awayteam);
    calculate(game.homestat, game.awaystat, hstat, astat, this.avgs, this.alpha);
    calculate(game.awaystat, game.homestat, astat, hstat, this.avgs, this.alpha);

    //doing home/away games
    hstat = this.getTeamStats('home', game.hometeam);
    astat = this.getTeamStats('away', game.awayteam);

    //predict based on current win stats (refactor out of here...decordate a predictor...)
    var mydate = new Date();
    mydate.setFullYear(2012);
    if (game.date > mydate) {
        if ((hstat.stat.off.winloss > astat.stat.off.winloss && game.homestat.winloss > 0.1) ||
            (hstat.stat.off.winloss < astat.stat.off.winloss && game.homestat.winloss < 0.1)) {
            this.prediction.wl.right += 1;
        } else {
            this.prediction.wl.wrong += 1;
        }
        if ((hstat.stat.off.pts > astat.stat.off.pts && game.homestat.winloss > 0.1) ||
            (hstat.stat.off.pts < astat.stat.off.pts && game.homestat.winloss < 0.1)) {
            this.prediction.pts.right += 1;
        } else {
            this.prediction.pts.wrong += 1;
        }
    }
    //end of prediction


    calculate(game.homestat, game.awaystat, hstat, astat, this.avgs, this.alpha);
    calculate(game.awaystat, game.homestat, astat, hstat, this.avgs, this.alpha);

    //todo: aggregate
};

ExponentialMovingAverageAnalyser.prototype.getTeamStats = function(collection, teamid) {
    'use strict';
    if (!_.isString(collection)) {
        collection = 'all';
    }
    if (_.isString(teamid)) {
        //first assure that it exists
        if (!_.has(this.teamstats[collection], teamid)) {
            this.teamstats[collection][teamid] = new ts.TeamWithOppStat({
                off: new ts.TeamStat(this.avgs),
                def: new ts.TeamStat(this.avgs)
            }, {
                off: new ts.TeamStat(this.avgs),
                def: new ts.TeamStat(this.avgs)
            });
        }
        return this.teamstats[collection][teamid];
    } else {
        return this.teamstats[collection];
    }
};

ExponentialMovingAverageAnalyser.prototype.exportCSV = function() {
    'use strict';
    var filename = 'results.csv';
    var that = this;

    if (fs.existsSync(filename)) {
        console.log('delete file...');
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
    //write averages
    stream.write('Averages:\n');
    _.each(this.avgs, function (value, key) {
        stream.write(key + ' = ' + value + '\n');
    });
    //write analyser info
    stream.write('EMA Analyser with alpha = ' + this.alpha + ' (N = ' + this.N + ', hl = ' + this.hl + ')\n');

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

    writeSection('all', 'ALL GAMES');
    writeSection('home', 'HOME GAMES ONLY');
    writeSection('away', 'AWAY GAMES ONLY');

    stream.end();
    console.log('results written to', filename);
};

module.exports = ExponentialMovingAverageAnalyser;

