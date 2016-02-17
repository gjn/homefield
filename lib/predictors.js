var _ = require('underscore');
var Games = require('./games').Games;

var WeigthAllStatsPredictor = function (o) {
    'use strict';

    if (!(this instanceof WeigthAllStatsPredictor)) {
        return new WeigthAllStatsPredictor(o);
    }

    var options = o || {};

    this.predictions = [];
};

WeigthAllStatsPredictor.prototype.initSeason = function(season) {

  this.season = season;

  this.seasonrecord = {
      correct: 0,
      wrong: 0
  };

};

var weekFilter = function(seasonref, weekref) {
  return function(game) {
    if (game.week == weekref &&
        game.season() == seasonref) {
      return true;
    }
    return false;
  }
};

var findPrediction = function(predictions, game) {
  var ret = undefined;
  _.each(predictions, function(prediction) {
    if (prediction.ht == game.hometeam &&
        prediction.at == game.awayteam) {
      ret = prediction;
      return;
    }
  });
  return ret;
};

var sign = function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};

var symmetrical = function(min, max) {
  if (sign(max) != sign(min)) {
    if (Math.abs(max) > Math.abs(min)) {
      min = Math.abs(max) * (Math.abs(min)/min);
    } else {
      max = Math.abs(min) * (Math.abs(max)/max);
    }
  }
  return {min: min, max: max};
}

var predictions = function(games, stats) {
  if (!games || !games.length) {
    return [];
  }
  var home = stats.teamstats.home;
  var away = stats.teamstats.away;
  var overall = stats.teamstats.overall;
  var predictionweek = games[games.length - 1].week;
  var homestat = function(t, offdef, s) {
    // For superbowl prediction, we take overall stats for both teams
    if (predictionweek == 21) {
      return overall[t].stat[offdef][s];
    }
    return home[t].stat[offdef][s];
  };
  var awaystat = function(t, offdef, s) {
    // For superbowl prediction, we take overall stats for both teams
    if (predictionweek == 21) {
      return overall[t].stat[offdef][s];
    }
    return away[t].stat[offdef][s];
  };
  var results = [];
  var mm = {
    min: {},
    max: {}
  };

  var am = {
    min: {},
    max: {}
  };

  _.each(away, function(s1, team1) {
    _.each(home, function(s2, team2) {
      if (team1 != team2 && team1 != undefined && team2 != undefined) {
        var w1 = homestat(team1, 'off', 'winloss') - awaystat(team2, 'off', 'winloss');
        var w2 = homestat(team2, 'off', 'winloss') - awaystat(team1, 'off', 'winloss');
        var p1 = (homestat(team1, 'off', 'pts') - homestat(team1, 'def', 'pts')) -
                (awaystat(team2, 'off', 'pts') - awaystat(team2, 'def', 'pts'));
        var p2 = (homestat(team2, 'off', 'pts') - homestat(team2, 'def', 'pts')) -
                (awaystat(team1, 'off', 'pts') - awaystat(team1, 'def', 'pts'));
        var y1 = (homestat(team1, 'off', 'yards') - homestat(team1, 'def', 'yards')) -
                (awaystat(team2, 'off', 'yards') - awaystat(team2, 'def', 'yards'));
        var y2 = (homestat(team2, 'off', 'yards') - homestat(team2, 'def', 'yards')) -
                (awaystat(team1, 'off', 'yards') - awaystat(team1, 'def', 'yards'));
        var t1 = (homestat(team1, 'off', 'to') - homestat(team1, 'def', 'to')) -
                (awaystat(team2, 'off', 'to') - awaystat(team2, 'def', 'to'));
        var t2 = (homestat(team2, 'off', 'to') - homestat(team2, 'def', 'to')) -
                (awaystat(team1, 'off', 'to') - awaystat(team1, 'def', 'to'));

        am.max.w = (am.max.w == undefined || w1 > am.max.w) ? w1 : am.max.w;
        am.max.p = (am.max.p == undefined || p1 > am.max.p) ? p1 : am.max.p;
        am.max.y = (am.max.y == undefined || y1 > am.max.y) ? y1 : am.max.y;
        am.max.t = (am.max.t == undefined || t1 > am.max.t) ? t1 : am.max.t;
        am.min.w = (am.min.w == undefined || w1 < am.min.w) ? w1 : am.min.w;
        am.min.p = (am.min.p == undefined || p1 < am.min.p) ? p1 : am.min.p;
        am.min.y = (am.min.y == undefined || y1 < am.min.y) ? y1 : am.min.y;
        am.min.t = (am.min.t == undefined || t1 < am.min.t) ? t1 : am.min.t;

        am.max.w = (am.max.w == undefined || w2 > am.max.w) ? w2 : am.max.w;
        am.max.p = (am.max.p == undefined || p2 > am.max.p) ? p2 : am.max.p;
        am.max.y = (am.max.y == undefined || y2 > am.max.y) ? y2 : am.max.y;
        am.max.t = (am.max.t == undefined || t2 > am.max.t) ? t2 : am.max.t;
        am.min.w = (am.min.w == undefined || w2 < am.min.w) ? w2 : am.min.w;
        am.min.p = (am.min.p == undefined || p2 < am.min.p) ? p2 : am.min.p;
        am.min.y = (am.min.y == undefined || y2 < am.min.y) ? y2 : am.min.y;
        am.min.t = (am.min.t == undefined || t2 < am.min.t) ? t2 : am.min.t;
      }
    });
  });

  _.each(games, function(g) {
    var w = homestat(g.hometeam, 'off', 'winloss') - awaystat(g.awayteam, 'off', 'winloss');
    var wt = w > 0 ? g.hometeam : g.awayteam;
    var p = (homestat(g.hometeam, 'off', 'pts') - homestat(g.hometeam, 'def', 'pts')) -
            (awaystat(g.awayteam, 'off', 'pts') - awaystat(g.awayteam, 'def', 'pts'));
    var pt = p > 0 ? g.hometeam : g.awayteam;
    var y = (homestat(g.hometeam, 'off', 'yards') - homestat(g.hometeam, 'def', 'yards')) -
            (awaystat(g.awayteam, 'off', 'yards') - awaystat(g.awayteam, 'def', 'yards'));
    var yt = y > 0 ? g.hometeam : g.awayteam;
    var t = (homestat(g.hometeam, 'off', 'to') - homestat(g.hometeam, 'def', 'to')) -
            (awaystat(g.awayteam, 'off', 'to') - awaystat(g.awayteam, 'def', 'to'));
    var tt = t > 0 ? g.hometeam : g.awayteam;
    results.push({
      ht: g.hometeam,
      at: g.awayteam,
      w: w,
      wt: wt,
      p: p,
      pt: pt,
      y: y,
      yt: yt,
      t: t,
      tt: tt
    });
    mm.max.w = (mm.max.w == undefined || w > mm.max.w) ? w : mm.max.w;
    mm.max.p = (mm.max.p == undefined || p > mm.max.p) ? p : mm.max.p;
    mm.max.y = (mm.max.y == undefined || y > mm.max.y) ? y : mm.max.y;
    mm.max.t = (mm.max.t == undefined || t > mm.max.t) ? t : mm.max.t;
    mm.min.w = (mm.min.w == undefined || w < mm.min.w) ? w : mm.min.w;
    mm.min.p = (mm.min.p == undefined || p < mm.min.p) ? p : mm.min.p;
    mm.min.y = (mm.min.y == undefined || y < mm.min.y) ? y : mm.min.y;
    mm.min.t = (mm.min.t == undefined || t < mm.min.t) ? t : mm.min.t;
  });

  var sym = symmetrical(mm.min.w, mm.max.w);
  mm.min.w = sym.min;
  mm.max.w = sym.max;
  sym = symmetrical(mm.min.p, mm.max.p);
  mm.min.p = sym.min;
  mm.max.p = sym.max;
  sym = symmetrical(mm.min.y, mm.max.y);
  mm.min.y = sym.min;
  mm.max.y = sym.max;
  sym = symmetrical(mm.min.t, mm.max.t);
  mm.min.t = sym.min;
  mm.max.t = sym.max;

  var slep = function(v, min, max) {
    if (max == min) {
      return 100.0;
    }
    return 100 * ((v - min) / (max - min));
  }

  //choose here range (all games or only current games"
  var pm = am;
  
  _.forEach(results, function(r) {
    r.ww = slep(r.w, pm.min.w, pm.max.w);
    r.pw = slep(r.p, pm.min.p, pm.max.p);
    r.yw = slep(r.y, pm.min.y, pm.max.y);
    r.tw = slep(r.t, pm.min.t, pm.max.t);

    r.o = ((6*r.ww) + (3*r.pw) + (2*r.tw) + r.yw) / 12.0;
    r.ot = r.ht;
    if (r.o < 50) {
      r.o = 100 - r.o;
      r.ot = r.at;
    }
  });

  return results;
}

WeigthAllStatsPredictor.prototype.newWeek = function(analysedGames, stats, games) {
    'use strict';

    // Let's see if we have a new season
    var lastAnalysedGame = analysedGames[analysedGames.length - 1];
    if (this.season != lastAnalysedGame.season()) {
      this.initSeason(lastAnalysedGame.season());
    }

    //Get this weeks played games
    var thisWeekGames = Games.filter(analysedGames, weekFilter(lastAnalysedGame.season(), lastAnalysedGame.week));
    if (lastAnalysedGame.week == 21) {
      var nextWeekGames = Games.filter(games, weekFilter(lastAnalysedGame.season() + 1, 1));
    } else {
      var nextWeekGames = Games.filter(games, weekFilter(lastAnalysedGame.season(), lastAnalysedGame.week + 1));
    }

    // First, we determine record of currently analysed games
    // and see how well be predicted them. The last predictions
    // are still in the predictions array
    if (this.predictions.length) {
      _.each(thisWeekGames, function(game) {
        var p = findPrediction(this.predictions, game);
        if (!p) {
          console.log('Prediction for game was not found, should not happen');
       } else {
         //Home team won
         var correct = false;
         if (game.homestat.pts > game.awaystat.pts &&
             p.ot == game.hometeam) {
           correct = true;
         } else if (game.awaystat.pts > game.homestat.pts &&
                    p.ot == game.awayteam) {
           correct = true;
         } else if (game.homestat.pts == game.awaystat.pts &&
                    p.o == 50.0) {
           correct = true;
         }
         if (correct) {
           this.seasonrecord.correct += 1;
         } else {
           this.seasonrecord.wrong += 1;
         }
       }
      }, this);
    }
    
    // Next we predict the next weeks games based on current rankings
    this.predictions = predictions(nextWeekGames, stats);
    return this;
};

module.exports = WeigthAllStatsPredictor;

