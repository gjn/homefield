var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var stringify = require('json-stringify-safe');

var Games = require('./games').Games;

var JSONExporter = function (o) {
    'use strict';

    if (!(this instanceof JSONExporter)) {
        return new JSONExporter(o);
    }

    var options = o || {};
    this._lastseasononly = true;
    this._splitlogic = options.splitlogic || 'season';
    this._overlap = options.overlap || 'false';
    
    this._nextresults = {};
    this._lastseason;
    this._lastweek;   
};

var optimizeGameForExport = function(g) {
  return {
    d: g.date.toISOString().slice(0,10).replace(/-/g,""),
    ht: g.hometeam,
    hs: {
      p: g.homestat.pts,
      y: g.homestat.yards,
      t: g.homestat.to
    },
    at: g.awayteam,
    as: {
      p: g.awaystat.pts,
      y: g.awaystat.yards,
      t: g.awaystat.to
    }
  };
};

JSONExporter.prototype._addScheduledGames = function(games) {
  if (!games) {
    return;
  }
  var that = this;
  _.each(games, function(g) {
    if (isNaN(g.homestat.pts)) {
      key = '_' + g.season() + (g.week < 10 ? '0':'') + g.week;
      if (!that._nextresults[key]) {
        that._nextresults[key] = {
          games: []
        }
      }
      that._nextresults[key].games.push(optimizeGameForExport(g));
    }
  });
};

JSONExporter.prototype.cleanup = function(season, games) {
  this._addScheduledGames(games);
  //check if we need to create export now and reset
  if (this._splitlogic == 'season') {
    this._create('.artefacts/res/' + season + '.js');
  } else if (this._splitlogic == 'week') {
    this._create('.artefacts/res/' + season + (this._lastweek < 10 ? '0':'') + this._lastweek + '.js');
  } else { //all
    this._create('.artefacts/res/all.js');
  }
};



JSONExporter.prototype.add = function(results, games) {
    'use strict';

    var weekGamesFilter = function(seasonref, weekref) {
      return function(game) {
        if (game.season() == seasonref &&
            game.week == weekref) {
          return true;
        }
        return false;
      }
    }
    var optimizeGamesForExport = function(ingames) {
      games = [];

      _.each(ingames, function(g) {
        games.push(optimizeGameForExport(g));
      })
      return games;
    };

    var lastGame = results.games[results.games.length - 1];
    var season = lastGame.season();
    var week = lastGame.week;
    var weekGames = optimizeGamesForExport(Games.filter(games, weekGamesFilter(season, week)));
    this._lastseason = this._lastseason || season;
    this._lastweek = this._lastweek || week;

    //check if we need to create export now and reset
    if (!this._lastseasononly) {
      if (this._splitlogic == 'season') {
        if (this._lastseason != season) {
          this.cleanup(this._lastseason);
        }
      } else if (this._splitlogic == 'week') {
        if (this._lastweek != week) {
          this.cleanup(this._lastseason);
        }
      }
    }

    this._lastseason = season;
    this._lastweek = week;

    //adapt results and add it
    var optimizeForExport = function(res) {
      var precs = {
        winloss: 2,
        pts: 1,
        yards: 0,
        to: 2,
        rating: 1,
        homefield: 1
      };
      var keymap = {
        stat: 's',
        oppstat: 'o',
        off: 'o',
        def: 'd',
        winloss: 'w',
        pts: 'p',
        yards: 'y',
        to: 't',
        rating: 'r',
        homefield: 'h',
        rankOfwinloss: 'rw',
        rankOfyards: 'ry',
        rankOfpts: 'rp',
        rankOfto: 'rt',
        rankOfrating: 'rr',
        rankOfhomefield: 'rh'
      };

      var newKey = function(oldKey) {
        if (keymap.hasOwnProperty(oldKey)) {
          return keymap[oldKey];
        }
        return undefined;
      };

      var newRes = {};
      _.each(res, function(opp, oppkey) {
        var newOppKey = newKey(oppkey);
        if (newOppKey) {
          if (!newRes.hasOwnProperty(newOppKey)) {
            newRes[newOppKey] = {};
          }
          _.each(opp, function(off, offkey) {
            var newOffKey = newKey(offkey);
            if (!newRes[newOppKey].hasOwnProperty[newOffKey]) {
              newRes[newOppKey][newOffKey] = {};
            }
            _.each(off, function(stat, statkey) {
              var newStatKey = newKey(statkey);
              if (newStatKey) {
                if (!newRes[newOppKey][newOffKey].hasOwnProperty(newStatKey)) {
                  newRes[newOppKey][newOffKey][newStatKey] = {};
                }
                newRes[newOppKey][newOffKey][newStatKey] = stat;
                if (precs.hasOwnProperty(statkey)) {
                  newRes[newOppKey][newOffKey][newStatKey] = parseFloat(stat.toFixed(precs[statkey]));
                }
              }
            });
          });
        }
      });
      return newRes;
    };

    //we copy over what we want
    var newRes = {};
    newRes.alpha = results.alpha;
    newRes.games = weekGames;
    newRes.averages = results.averages;
    newRes.stats = {};
    newRes.stats.home = results.teamstats.home;
    newRes.stats.away = results.teamstats.away;
    newRes.stats.overall = results.teamstats.overall;
    newRes.predictions = {};
    newRes.predictions.record = {};
    newRes.predictions.record.correct = results.predictions.seasonrecord.correct;
    newRes.predictions.record.wrong = results.predictions.seasonrecord.wrong;
    
    _.each(newRes.stats, function(ts) {
      _.each(ts, function(res) {
        if (res.team != undefined) {
          ts[res.team] = optimizeForExport(res);
        }
      });
    });

    newRes.predictions.nextweek = [];
    _.each(results.predictions.predictions, function(p) {
      newRes.predictions.nextweek.push({
        ht: p.ht,
        at: p.at,
        w: parseFloat(p.w.toFixed(1)),
        wt: p.wt,
        p: parseInt(p.p.toFixed(0), 10),
        pt: p.pt,
        y: parseInt(p.y.toFixed(0), 10),
        yt: p.yt,
        t: parseFloat(p.t.toFixed(1)),
        tt: p.tt,
        o: parseInt(p.o.toFixed(0), 10),
        ot: p.ot
      });
    });

    this._nextresults['_' + season + (week < 10 ? '0':'') + week] = newRes; 

};


JSONExporter.prototype._create = function(filename) {
    'use strict';

    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
        if (fs.existsSync(filename)) {
          console.log('Something is wrong when deleting the file');
        }
    }
    var overlapkey, overlapped;

    //To get rid of quotes from keys
    var string = stringify(this._nextresults, null, 2);
    var newObj = JSON.parse(string);
    var writeout = util.inspect(newObj, {depth: null});
    fs.writeFileSync(filename, writeout);

    //Reset old results
    if (this._overlap) {
      overlapkey = '_' + this._lastseason + (this._lastweek < 10 ? '0':'') + this._lastweek;
      overlapped = this._nextresults[overlapkey];
    }
    this._nextresults = {};
    if (overlapkey && overlapped) {
      this._nextresults[overlapkey] = overlapped;
    }
    console.log('results written to', filename);
};

module.exports = JSONExporter;

