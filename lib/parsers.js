var fs = require('fs');

var ParseProFootballReferenceCSV = function () {
    'use strict';

    if (!(this instanceof ParseProFootballReferenceCSV)) {
        return new ParseProFootballReferenceCSV();
    }
};

function parseCsvFile(fileName, callback, endcallback) {
    'use strict';
    var stream = fs.createReadStream(fileName),
        iteration = 0,
        header = [],
        buffer = '',
        pattern = ',';

    function buildRecord(str) {
        var record = {};
        str.split(pattern).forEach(function (value, index) {
            if (header[index] !== '') {
                record[header[index].toLowerCase()] = value.replace(/"/g, '');
            }
        });
        return record;
    }
    stream.on('data', function (data) {
        buffer += data.toString();
        var parts = buffer.split('\n');
        parts.forEach(function (d, i) {
            if (i === parts.length - 1) {
                return;
            }
            if (iteration === 0 && i === 0) {
                header = d.split(pattern);
            } else {
                callback(buildRecord(d));
            }
            iteration += 1;
        });
        buffer = parts[parts.length - 1];
    });
    stream.on('end', function() {
        endcallback();
    });
}

ParseProFootballReferenceCSV.prototype.parse = function (filename, gamecallback, endcallback) {
    'use strict'
    var record_properties = ['week', 'day', 'date', 'year', 'ignore', 'winner', 'winnerawayteam', 'loser'],
        i = 0;

    function parseRecord(record) {
        var winning, losing, date;
        //first, make sure that we have all that we want
        for (i = 0; i < record_properties.length; i += 1) {
            if (!record.hasOwnProperty(record_properties[i])) {
                return;
            }
        }
        date = new Date(record.date);
        date.setFullYear(parseInt(record.year, 10));
        winning = {
            team: record.winner,
            pts: parseInt(record.ptsw, 10),
            yds: parseInt(record.ydsw, 10),
            to: parseInt(record.tow, 10)
        };
        losing = {
            team: record.loser,
            pts: parseInt(record.ptsl, 10),
            yds: parseInt(record.ydsl, 10),
            to: parseInt(record.tol, 10)
        };
        // Game not yet played
        if (isNaN(winning.pts)) {
            gamecallback(date, losing, winning, record.week);
        } else if (record.winnerawayteam === '@') {
            gamecallback(date, losing, winning, record.week);
        } else if (record.winnerawayteam === '') {
            gamecallback(date, winning, losing, record.week);
        } else {
            throw new Error('not clear which team is home team');
        }
    }
    parseCsvFile(filename, parseRecord, endcallback);
};

module.exports = ParseProFootballReferenceCSV;

