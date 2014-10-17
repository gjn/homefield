var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var stringify = require('json-stringify-safe');

var JSONExporter = function (o) {
    'use strict';

    if (!(this instanceof JSONExporter)) {
        return new JSONExporter(o);
    }

    var options = o || {};
    this._splitlogic = options.splitlogic || 'season';
    
    this._nextresults = {};
    this._lastseason;
    this._lastweek;   
};

JSONExporter.prototype.cleanup = function() {
  //check if we need to create export now and reset
  if (this._splitlogic == 'season') {
    this._create('.artefacts/res/' + this._lastseason + '.js');
  } else if (this._splitlogic == 'week') {
    this._create('.artefacts/res/' + this._lastseason + (this._lastweek < 10 ? '0':'') + this._lastweek + '.js');
  } else { //all
    this._create('.artefacts/res/all.js');
  }
};

JSONExporter.prototype.add = function(results) {
    'use strict';

    var lastGame = results.games[results.games.length - 1];
    var season = lastGame.season();
    var week = lastGame.week;
    this._lastseason = this._lastseason || season;
    this._lastweek = this._lastweek || week;

    //check if we need to create export now and reset
    if (this._splitlogic == 'season') {
      if (this._lastseason != season) {
        this.cleanup();
      }
    } else if (this._splitlogic == 'week') {
      if (this._lastweek != week) {
        this.cleanup();
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
        to: 2
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
        rankOfwinloss: 'rw',
        rankOfyards: 'ry',
        rankOfpts: 'rp',
        rankOfto: 'rt'
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
              if (!newRes[newOppKey][newOffKey].hasOwnProperty(newStatKey)) {
                newRes[newOppKey][newOffKey][newStatKey] = {};
              }
              newRes[newOppKey][newOffKey][newStatKey] = stat;
              if (precs.hasOwnProperty(statkey)) {
                newRes[newOppKey][newOffKey][newStatKey] = parseFloat(stat.toFixed(precs[statkey]));
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
    newRes.averages = results.averages;
    newRes.stats = {};
    newRes.stats.home = results.teamstats.home;
    newRes.stats.away = results.teamstats.away;
    newRes.stats.average = results.teamstats.average;
    
    _.each(newRes.stats, function(ts) {
      _.each(ts, function(res) {
        ts[res.team] = optimizeForExport(res);
      });
    });

    this._nextresults['_' + season + (week < 10 ? '0':'') + week] = newRes; 

};


JSONExporter.prototype._create = function(filename) {
    'use strict';

    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    }

    var stream = fs.createWriteStream(filename);
    //To get rid of quotes from keys
    var string = stringify(this._nextresults, null, 2);
    var newObj = JSON.parse(string);
    stream.write(util.inspect(newObj, {depth: null}));
    stream.end();
    this._nextresults = {};
    console.log('results written to', filename);
};

module.exports = JSONExporter;

