hf.stats = hf.stats || {};

var Timeset = function(start, end, statdef) {

  if (!(this instanceof Timeset)) {
    return new Timeset(s, w, statdef);
  }

  var getType = function(t) {
    if (t == 'h') {
      return 'home';
    } else if (t == 'a') {
      return 'away';
    }
    return 'overall';
  };

  var _type = statdef[0],
      _ownopp = statdef[1],
      _offdef = statdef[2],
      _stat = statdef[3],
      _data = hf.stats.data,
      _teams,
      _weeks = [],
      _array,
      _filter,
      _aggregator,
      _key = function(season, week) {
        return season + (week < 10 ? '0' : '') + week;
      }

  //Get the range into the weeks array
  var w = start.week;
  for (var season = start.season; season <= end.season; season++) {
    var endWeek = season == end.season ? end.week : 21;
    for (var week = w; week <= endWeek; week ++) {
      _weeks.push(_key(season, week));
    }
    w = 1;
  }

  updateArrays = function() {
    _array = [];
    _teams = [];
    var unfiltered = _data['_' + _weeks[0]].stats[getType(_type)];
    if (_aggregator) {
      unfiltered = _aggregator.aggregate();
    }
    for (p in unfiltered) {
      if (!_filter || _filter.teamfilter(p)) {
        _teams.push(p);
      }
    }
    //Prepare the array for d3
    _array = _teams.map(function(t) {
      return {
        team: t,
        values: _weeks.map(function(w) {
          return { team: t, week: w };
        })
      };
    });
  }

  updateArrays();

  this.statName = function() {
    return hf.meta.statName(_stat, _offdef);
  };

  this.filter = function(s) {
    if (!s) {
      _filter = undefined;
    } else {
      _filter = new hf.stats.Filter(s);
    }
    updateArrays();
    return this;
  };

  this.aggregate = function(s) {
    if (!s) {
      _aggregator = undefined;
    } else {
      _aggregator = new hf.stats.Aggregator(s);
    }
    updateArrays();
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
  
  this.teams = function() {
    return _teams;
  };

  this.weeks = function() {
    return _weeks;
  };

  this.array = function() {
    return _array;
  };

  var value = function(week, type, team, ownopp, offdef, stat) {
    if (offdef == 'u') {
      var val = _data['_' + week].stats[getType(type)][team][ownopp]['o'][stat] -
             _data['_' + week].stats[getType(type)][team][ownopp]['d'][stat];
      if (stat == 't') {
        val *= -1.0;
      }
      return val;
    }
    return _data['_' + week].stats[getType(type)][team][ownopp][offdef][stat];
  };

  this.stat = function(week, team) {
    if (!_data['_' + week]) {
      return undefined;
    }
    if (_aggregator) {
      return _aggregator.teams(team).map(function(t) {
        return value(week, _type, t, _ownopp, _offdef, _stat);
      }).reduce(function(v, o) {
        return v + o;
      }, 0) / _aggregator.teams(team).length;
    } else {
      return value(week, _type, team, _ownopp, _offdef, _stat);
    }
  };

};

hf.stats.Timeset = Timeset;

