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

  var statKey = function() {
    return '_' + _season + (_week < 10 ? '0' : '') + _week;
  };

  var _data = hf.stats.data[statKey()];

  this.getPreviousWeekSet = function() {
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

  this.sortf = function(team1, team2, rank) {
    if (!_data) {
      return 0;
    }
    s1 = this.teamStat(team1, rank);
    s2 = this.teamStat(team2, rank);
    if (s1 > s2) {
      return _offdef == 'o' ? -1 : 1;
    } else if (s1 < s2) {
      return _offdef == 'o' ? 1 : -1;
    } else {
      return 0;
    }
  };

};

hf.stats.Set = Set;

