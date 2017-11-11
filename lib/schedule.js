var _ = require('underscore');
var Games = require('./games').Games;

var StrengthOfSchedule = function (o) {
    'use strict';

    if (!(this instanceof StrengthOfSchedule)) {
        return new StrengthOfSchedule(o);
    }

    var options = o || {};
};

var weekGamesFilter = function(seasonref, weekref) {
  return function(game) {
    if (weekref == game.week &&
        seasonref == game.season()) {
      return true;
    }
    return false;
  };
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

var getStrenghtOfSchedule = function(SOS, games, stats) {
    'use strict';

    _.each(games, function(game) {
      var HT = getOrCreate(SOS, game.hometeam);
      var AT = getOrCreate(SOS, game.awayteam);
      HT.num += 1;
      AT.num += 1;
      if (stats.teamstats.away[game.awayteam].stat) {
        HT.sum += stats.teamstats.away[game.awayteam].stat.off.winloss;
        AT.sum += stats.teamstats.home[game.hometeam].stat.off.winloss;
      } else {
        HT.sum += stats.teamstats.away[game.awayteam].s.o.w;
        AT.sum += stats.teamstats.home[game.hometeam].s.o.w;
      }
    });

    _.each(SOS, function(S) {
      S.avg = S.sum / S.num;
    });

    return SOS;
}

// Season and Week from the stats
StrengthOfSchedule.prototype.remainingSchedule = function(currentStats, season, week, games) {
    'use strict';

    var remainingGames = Games.filter(games, scheduleGamesFilter(season, week));
    return getStrenghtOfSchedule({}, remainingGames, currentStats);
};


StrengthOfSchedule.prototype.playedSchedule = function(oldstats, season, week, games) {
    'use strict';
    var SOS = {};
    // Copy state for old SOSPlayed
    _.each(oldstats.SOSPlayed, function(S, key) {
      SOS[key] = S;
      if (week == 1) {
        SOS[key].sum = 0.0;
        SOS[key].num = 0;
        SOS[key].avg = 0.0;
      }
    });
    var weekGames = Games.filter(games, weekGamesFilter(season, week));
    return getStrenghtOfSchedule(SOS, weekGames, oldstats);
};




module.exports = StrengthOfSchedule;

