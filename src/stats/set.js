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
    } else if (t == 's') {
      return 'SOS';
    } else if (t == 'p') {
      return 'SOSPlayed';
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
  if (_type != 's' && _type != 'p' && _data) {
    _data = _data.stats;
  }
  var _array;

  var updateArray = function() {
    _array = [];
    if (_data) {
      var unfiltered = _data[getType(_type)];
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

  this.precision = function() {
    //SOS
    if (_type == 's' || _type == 'p' ||
        _stat == 'w' || _stat == 't') {
      return 2;
    }
    if (_stat == 'y') {
      return 0;
    }
    return 1;
  };

  this.addendum = function() {
    if ((_stat == 'h' || _stat == 'r') &&
       (_type != 's' && _type != 'p')) {
      return '%';
    }
    return '';
  };

  this.filter = function(s) {
    if (!s) {
      _filter = undefined;
    } else {
      _filter = new hf.stats.Filter(s);
    }
    updateArray();
    return this;
  };

  this.isAggregate = function() {
    return !!_aggregator;
  };

  this.hasFilter = function() {
    return !!_filter;
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

  this.getOffDef = function() {
    return _offdef;
  };
  
  this.setOffDef = function(o) {
    _offdef = o;
  }

  this.getStat = function() {
    return _stat;
  };
  
  this.setStat = function(s) {
    _stat = s;
  };
  
  this.array = function() {
    return _array;
  };

  this.previousWeek = function() {
    if (_aggregator || _filter) {
      return undefined;
    }
    var newSeason = _season;
    var newWeek = _week - 1;
    if (newWeek <= 0) {
      newSeason = _season - 1;
      newWeek = 21;
    }
    return new Set(newSeason, newWeek, _type + _ownopp + _offdef + _stat);
  };

  this.statName = function() {
    return hf.meta.statName(_stat, _offdef);
  };

	this.hasRanking = function() {
    if (_type == 'p' || _type == 's') {
      return false;
    }
    if (_offdef == 'u' && _stat != 'p' || _stat == 'y' ||  _stat == 't') {
      return false;
    }
    if (_stat == 'w' || _stat == 'p' || _stat == 'y' ||
        _stat == 't' || _stat == 'r' || _stat == 'h') {
			return true;
		}
		return false;
	}

  this.teamStat = function(team, ranking) {
    var statKey = _stat;
    if (ranking && this.hasRanking()) {
      statKey = 'r' + _stat;
    }
    return this.stat(getType(_type), team, _ownopp, _offdef, statKey);
  };

  var value = function(type, team, ownopp, offdef, stat) {
    if (type == 'SOS') {
      return _data[type][team];
    } else if (type == 'SOSPlayed') {
      return _data[type][team];
    }

    if (offdef == 'u' && stat != 'rp' && stat!= 'ry' && stat != 'rt') {
      var val = _data[type][team][ownopp]['o'][stat] -
             _data[type][team][ownopp]['d'][stat];
      if (stat == 't') {
        val *= -1.0;
      }
      return val;
    }
    return _data[type][team][ownopp][offdef][stat];
  }

  this.stat = function(type, team, ownopp, offdef, stat) {
    if (!_data) {
      return undefined;
    }
    if (_aggregator) {
      return _aggregator.teams(team).map(function(t) {
        return value(type, t, ownopp, offdef, stat);
      }).reduce(function(v, o) {
        return v + o;
      }, 0) / _aggregator.teams(team).length;
    }
    return value(type, team, ownopp, offdef, stat);
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

