hf.stats = hf.stats || {};

/*
 * Aggreator is used to aggregate statistics
 * You can aggreate into divisions or conferences
 * (team aggregates)
 * You can aggregate statistics by certain
 * formulas
 */
var Aggregator = function(s) {

  if (!(this instanceof Aggregator)) {
    return new Aggregator(s);
  }

  var noFunc = function(t) {
    return t;
  };

  var _s = s;
  var _teamsFn = noFunc;

  this.aggregate = function() {
    if (_s == 'divisions') {
      _teamsFn = hf.meta.teamsOfDivision;
      return { 
        NFCN: 'NFCN',
        NFCW: 'NFCW',
        NFCS: 'NFCS',
        NFCE: 'NFCE',
        AFCN: 'AFCN',
        AFCW: 'AFCW',
        AFCS: 'AFCS',
        AFCE: 'AFCE'
      };
    }
    else if (_s == 'conferences') {
      _teamsFn = hf.meta.teamsOfConference;
      return {
        NFC: 'NFC',
        AFC: 'AFC'
      };
    }
    _teamsFn = noFunc;
    return hf.meta.teamsAsObject;
  };

  this.teams = function(id) {
    return _teamsFn(id);
  }

};

hf.stats.Aggregator = Aggregator;

