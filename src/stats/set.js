hf.stats = hf.stats || {};

var Set = function(s, w, statdef) {

  if (!(this instanceof Set)) {
    return new Set(s, w, statdef);
  }

  var getType = function(t) {
    if (t == 'h') {
      return 'home';
    } else if (t == 'a') {
      return 'away';
    }
    return 'overall';
  };

  var _filter;
  var _aggregator;
  var _season = s;
  var _week = w;
  var _type = statdef[0];
  var _ownopp = statdef[1];
  var _offdef = statdef[2];
  var _stat = statdef[3];
  var _data = hf.stats.data['_' + _season + (_week < 10 ? '0' : '') + _week];
  var _array;

  var updateArray = function() {
    _array = [];
    if (_data) {
      var unfiltered = _data.stats[getType(_type)];
      if (_aggregator) {
        unfiltered = _aggregator.aggregate();
      }
      for (p in unfiltered) {
        if (!_filter || _filter.teamfilter(p)) {
          _array.push(p);
        }
      }
    }
  };

  updateArray();

  this.filter = function(s) {
    if (!s) {
      _filter = undefined;
    } else {
      _filter = new hf.stats.Filter(s);
    }
    updateArray();
    return this;
  };

  this.aggregate = function(s) {
    if (!s) {
      _aggregator = undefined;
    } else {
      _aggregator = new hf.stats.Aggregator(s);
    }
    updateArray();
    return this;
  };

  this.setOwnOpp = function(o) {
    _ownopp = o;
  }
  
  this.setOffDef = function(o) {
    _offdef = o;
  }
  
  this.setStat = function(s) {
    _stat = s;
  }
  
  this.array = function() {
    return _array;
  };

  this.previousWeek = function() {
    var newSeason = _season;
    var newWeek = _week - 1;
    if (newWeek <= 0) {
      newSeason = _season - 1;
      newWeek = 21;
    }
    return new Set(newSeason, newWeek, _type + _ownopp + _offdef + _stat);
  };

  this.statName = function() {
    if (_stat == 'w') {
      return 'Win Rate';
    } else if (_stat == 'p') {
      return 'Points';
    } else if (_stat == 'y') {
      return 'Yards';
    } else if (_stat == 't') {
      return 'Turnovers';
    }
    return 'Unknown';
  };

  this.teamStat = function(team, ranking) {
    var statKey = _stat;
    if (ranking){
      statKey = 'r' + _stat;
    }
    return this.stat(getType(_type), team, _ownopp, _offdef, statKey);
  };

  this.stat = function(type, team, ownopp, offdef, stat) {
    if (!_data) {
      return undefined;
    }
    if (_aggregator) {
      return _aggregator.teams(team).map(function(t) {
        return _data.stats[type][t][ownopp][offdef][stat];
      }).reduce(function(v, o) {
        return v + o;
      }, 0) / _aggregator.teams(team).length;
    }
    return _data.stats[type][team][ownopp][offdef][stat];
  };

  this.sort = function(ascending) {
    var that = this;
    _array.sort(function(t1, t2) {
      var s1 = that.teamStat(t1);
      var s2 = that.teamStat(t2);
      if (ascending) {
        if (s1 > s2) {
          return 1;
        } else if (s1 < s2) {
          return -1;
        }
      } else {
        if (s1 > s2) {
          return -1;
        } else if (s1 < s2) {
          return 1;
        }
      }
      return 0;
    });
  };
};

hf.stats.Set = Set;

