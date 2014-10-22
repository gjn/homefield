hf.stats = hf.stats || {};

var Set = function(s, w, t, own, off, stat) {

  if (!(this instanceof Set)) {
    return new Set(s, w, t, own, off, stat);
  }
  
  var _season = s;
  var _week = w;
  var _type = t || 'average';
  var _ownopp = own || 's';
  var _offdef = off || 'o';
  var _stat = stat || 'w';
  var _data = hf.stats.data['_' + _season + (_week < 10 ? '0' : '') + _week];
  var _array = [];
  //Array only contains the teams. d3 uses it for it's tasks
  //Sorting is directly applied to this array
  if (_data) {
    for (p in _data.stats[_type]) {
      _array.push(p);
    }
  }

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
    return new Set(newSeason, newWeek, _type, _ownopp, _offdef, _stat);
  };

  this.stats = function() {
    if (!_data) {
      return undefined;
    }
    return _data.stats[_type];
  };

  this.teamStat = function(team, ranking) {
    if (!_data) {
      return undefined;
    }
    var statKey = _stat;
    if (ranking){
      statKey = 'r' + _stat;
    }
    return _data.stats[_type][team][_ownopp][_offdef][statKey];
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

  this.stat = function(type, team, ownopp, offdef, stat) {
    return _data.stats[type][team][ownopp][offdef][stat];
  };

  this.sortstat = function(type, ownopp, offdef, stat, ascending) {
    var that = this;
    _array.sort(function(t1, t2) {
      var s1 = that.stat(type, t1, ownopp, offdef, stat);
      var s2 = that.stat(type, t2, ownopp, offdef, stat);
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

