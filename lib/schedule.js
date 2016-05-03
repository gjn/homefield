var _ = require('underscore');
var Games = require('./games').Games;

var StrengthOfSchedule = function (o) {
    'use strict';

    if (!(this instanceof StrengthOfSchedule)) {
        return new StrengthOfSchedule(o);
    }

    var options = o || {};

    this.schedule = {};
};

var scheduleGamesFilter = function(seasonref, weekref) {
  return function(game) {
    //If Superbowl, then assume next regular season schedule
    if (weekref == 21) {
      if (seasonref + 1 == game.season() &&
          game.week <= 17) {
        return true;
      }
    //If seasonend or in playoffs, assume next week only
    } else if (weekref > 16 && weekref < 21) {
      if (seasonref == game.season() &&
          weekref + 1 == game.week) {
        return true;
      }
    //If during week, all regular season games
    } else if (weekref <=16) {
      if (seasonref == game.season() &&
          weekref < game.week &&
          game.week <= 17) {
        return true;
      }
    }
    return false;
  }
};

var getOrCreate = function(SOS, team) {
  if (!SOS.hasOwnProperty(team)) {
    SOS[team] = {
      sum: 0.0,
      num: 0
    }
  }
  return SOS[team];
}

// Season and Week from the stats
StrengthOfSchedule.prototype.remainingSchedule = function(currentStats, season, week, games) {
    'use strict';

    var remainingGames = Games.filter(games, scheduleGamesFilter(season, week));

    var SOS = {}

    _.each(remainingGames, function(game) {
      var HT = getOrCreate(SOS, game.hometeam);
      var AT = getOrCreate(SOS, game.awayteam);
      
      HT.sum += currentStats.teamstats.away[game.awayteam].stat.off.homefield;
      HT.num += 1;
      AT.sum += currentStats.teamstats.home[game.hometeam].stat.off.homefield;
      AT.num += 1;
    });

    _.each(SOS, function(S) {
      S.avg = S.sum / S.num;
    });

    this.schedule = SOS;
    return this;
};

module.exports = StrengthOfSchedule;

