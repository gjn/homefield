
var fs = require('fs');
var sys = require('sys');

function parsersModule() {
    "use strict";
    var that = {};

    function parseCsvFile(fileName, callback) {
        var stream = fs.createReadStream(fileName),
            iteration = 0,
            header = [],
            buffer = "",
            pattern = ",";

        function buildRecord(str) {
            var record = {};

            str.split(pattern).forEach(function (value, index) {
                if (header[index] !== '') {
                    record[header[index].toLowerCase()] = value.replace(/"/g, '');
                }
            });
            return record;
        }
        stream.addListener('data', function (data) {
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

    }


    //Week,Day,Date,ignore,Winner,FirstAwayTeam,Loser,PtsW,PtsL,YdsW,TOW,YdsL,TOL
    that.parsePFRGamesFile = function (filename, gamecallback, endcallback) {
        var record_properties = ['week', 'day', 'date', 'year', 'ignore', 'winner', 'winnerawayteam', 'loser', 'ptsw', 'ptsl', 'ydsw', 'tow', 'ydsl', 'tol'],
            i = 0,
            count = 0;

        function parseRecord(record) {
            var winning, losing, date;
            //first, make sure that we have all that we want
            for (i = 0; i < record_properties.length; i += 1) {
                if (!record.hasOwnProperty(record_properties[i])) {
                    //we assume that we are finished. We need to find a better way to signal end of file parsing...
                    endcallback();
                    return;
                }
            }
            date = new Date(record.date);
            date.setFullYear(parseInt(record.year, 10));
            winning = {
                team: record.winner,
                pts: record.ptsw,
                yds: record.ydsw,
                to: record.tow
            };
            losing = {
                team: record.loser,
                pts: record.ptsl,
                yds: record.ydsl,
                to: record.tol
            };
            if (record.winnerawayteam === '@') {
                gamecallback(date, losing, winning);
            } else if (record.winnerawayteam === '') {
                gamecallback(date, winning, losing);
            } else {
                throw new Error('not clear which team is home team');
            }
        }
        parseCsvFile(filename, parseRecord);
    };

    return that;
}

exports.parsers = parsersModule();

