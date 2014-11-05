hf.stats = hf.stats || {};

var Timeset = function(start, end, t, own, off, stat) {

  if (!(this instanceof Timeset)) {
    return new Timeset(s, w, t, own, off, stat);
  }
  
  var _type = t || 'average',
      _ownopp = own || 's',
      _offdef = off || 'o',
      _stat = stat || 'w',
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
  console.log(start, end);
  for (var season = start.season; season <= end.season; season++) {
    var endWeek = season == end.season ? end.week : 21;
    console.log(endWeek);
    for (var week = w; week <= endWeek; week ++) {
      _weeks.push(_key(season, week));
    }
    w = 1;
  }

  console.log(_weeks);

  updateArrays = function() {
    _array = [];
    _teams = [];
    unfiltered = _data['_' + _weeks[0]].stats[_type];
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

  this.stat = function(week, team) {
    if (!_data['_' + week]) {
      return undefined;
    }
    if (_aggregator) {
      var val = _aggregator.teams(team).map(function(t) {
        return _data['_' + week].stats[_type][t][_ownopp][_offdef][_stat];
      }).reduce(function(v, o) {
        return v + o;
      }, 0) / _aggregator.teams(team).length;
      console.log(val);
      return val;
    } else {
      return _data['_' + week].stats[_type][team][_ownopp][_offdef][_stat];
    }
  };

};

hf.stats.Timeset = Timeset;

