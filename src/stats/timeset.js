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
    //Get team array with first week
    if (_data['_' + _weeks[0]]) {
      for (p in _data['_' + _weeks[0]].stats[_type]) {
        if (!_filter || _filter.teamfilter(p)) {
          _teams.push(p);
        }
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

  this.setFilter = function(s) {
    if (!s) {
      _filter = undefined;
    } else {
      _filter = new hf.stats.Filter(s);
    }
    updateArrays();
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
    return _data['_' + week].stats[_type][team][_ownopp][_offdef][_stat];
  };

};

hf.stats.Timeset = Timeset;

