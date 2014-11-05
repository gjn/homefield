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
  var _s = s; //hf.meta.teamsOfDivision();
  var _teamsFn = hf.meta.teamsOfDivision;

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
    _teamsFn = hf.meta.teamsOfDivision;
    return {
      NFC: 'NFC',
      AFC: 'AFC'
    };
  };

  this.teams = function(id) {
    return _teamsFn(id);
  }

};

hf.stats.Aggregator = Aggregator;

