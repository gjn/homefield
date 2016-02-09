var _ = require('underscore');
var ts = require('./teamstat');

var WeigthAllStatsPredictor = function (o) {
    'use strict';

    if (!(this instanceof WeigthAllStatsPredictor)) {
        return new WeightAllStatsPredictor(o);
    }

    var options = o || {};
};

WeightAllStatsPredictor.prototype.analyseNewWeek = function() {
    'use strict';

    return this;
};

module.exports = WeightAllStatsPredictor;

