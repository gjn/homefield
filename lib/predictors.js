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

  // contains predictions for next set of games
  //this.predictions = [
  //];

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
  var maxw, maxp, maxy, maxt;
  var minw, minp, miny, mint;

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
    maxw = (maxw == undefined || w > maxw) ? w : maxw;
    maxp = (maxp == undefined || p > maxp) ? p : maxp;
    maxy = (maxy == undefined || y > maxy) ? y : maxy;
    maxt = (maxt == undefined || t > maxt) ? t : maxt;
    minw = (minw == undefined || w < minw) ? w : minw;
    minp = (minp == undefined || p < minp) ? p : minp;
    miny = (miny == undefined || y < miny) ? y : miny;
    mint = (mint == undefined || t < mint) ? t : mint;
  });

  var sym = symmetrical(minw, maxw);
  minw = sym.min;
  maxw = sym.max;
  sym = symmetrical(minp, maxp);
  minp = sym.min;
  maxp = sym.max;
  sym = symmetrical(miny, maxy);
  miny = sym.min;
  maxy = sym.max;
  sym = symmetrical(mint, maxt);
  mint = sym.min;
  maxt = sym.max;

  var slep = function(v, max, min) {
    if (max == min) {
      return 100.0;
    }
    return 100 * ((v - min) / (max - min));
  }
  
  _.forEach(results, function(r) {
    r.ww = slep(r.w, maxw, minw);
    r.pw = slep(r.p, maxp, minp);
    r.yw = slep(r.y, maxy, miny);
    r.tw = slep(r.t, maxt, mint);

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

