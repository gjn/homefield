
function defsModule() {
    "use strict";
    var that = {},
        longToShort = {
            'Dallas Cowboys': 'DAL',
            'New York Giants': 'NYG',
            'Denver Broncos': 'DEN',
            'Pittsburgh Steelers': 'PIT',
            'Arizona Cardinals': 'ARI',
            'Seattle Seahawks': 'SEA',
            'Washington Redskins': 'WAS',
            'New Orleans Saints': 'NO',
            'Minnesota Vikings': 'MIN',
            'Jacksonville Jaguars': 'JAC',
            'Houston Texans': 'HOU',
            'Miami Dolphins': 'MIA',
            'Philadelphia Eagles': 'PHI',
            'Cleveland Browns': 'CLE',
            'Chicago Bears': 'CHI',
            'Indianapolis Colts': 'IND',
            'Atlanta Falcons': 'ATL',
            'Kansas City Chiefs': 'KC',
            'New England Patriots': 'NE',
            'Tennessee Titans': 'TEN',
            'New York Jets': 'NYJ',
            'Buffalo Bills': 'BUF',
            'San Francisco 49ers': 'SF',
            'Green Bay Packers': 'GB',
            'Tampa Bay Buccaneers': 'TB',
            'Carolina Panthers': 'CAR',
            'Detroit Lions': 'DET',
            'St. Louis Rams': 'STL',
            'San Diego Chargers': 'SD',
            'Oakland Raiders': 'OAK',
            'Baltimore Ravens': 'BAL',
            'Cincinnati Bengals': 'CIN'
        },
        shortToLong = {
            DAL: 'Dallas Cowboys',
            NYG: 'New York Giants',
            DEN: 'Denver Broncos',
            PIT: 'Pittsburgh Steelers',
            ARI: 'Arizona Cardinals',
            SEA: 'Seattle Seahawks',
            WAS: 'Washington Redskins',
            NO: 'New Orleans Saints',
            MIN: 'Minnesota Vikings',
            JAC: 'Jacksonville Jaguars',
            HOU: 'Houston Texans',
            MIA: 'Miami Dolphins',
            PHI: 'Philadelphia Eagles',
            CLE: 'Cleveland Browns',
            CHI: 'Chicago Bears',
            IND: 'Indianapolis Colts',
            ATL: 'Atlanta Falcons',
            KC: 'Kansas City Chiefs',
            NE: 'New England Patriots',
            TEN: 'Tennessee Titans',
            NYJ: 'New York Jets',
            BUF: 'Buffalo Bills',
            SF: 'San Francisco 49ers',
            GB: 'Green Bay Packers',
            TB: 'Tampa Bay Buccaneers',
            CAR: 'Carolina Panthers',
            DET: 'Detroit Lions',
            STL: 'St. Louis Rams',
            SD: 'San Diego Chargers',
            OAK: 'Oakland Raiders',
            BAL: 'Baltimore Ravens',
            CIN: 'Cincinnati Bengals'
        },
        teamToDiv = {
            DAL: 'NE',
            NYG: 'NE',
            DEN: 'AW',
            PIT: 'AN',
            ARI: 'NW',
            SEA: 'NW',
            WAS: 'NE',
            NO: 'NS',
            MIN: 'NN',
            JAC: 'AS',
            HOU: 'AS',
            MIA: 'AE',
            PHI: 'NE',
            CLE: 'AN',
            CHI: 'NN',
            IND: 'AS',
            ATL: 'NS',
            KC: 'AW',
            NE: 'AE',
            TEN: 'AS',
            NYJ: 'AE',
            BUF: 'AE',
            SF: 'NW',
            GB: 'NN',
            TB: 'NS',
            CAR: 'NS',
            DET: 'NN',
            STL: 'NW',
            SD: 'AW',
            OAK: 'AW',
            BAL: 'AN',
            CIN: 'AN'
        },
        teamToConf = {
            DAL: 'NFC',
            NYG: 'NFC',
            DEN: 'AFC',
            PIT: 'AFC',
            ARI: 'NFC',
            SEA: 'NFC',
            WAS: 'NFC',
            NO: 'NFC',
            MIN: 'NFC',
            JAC: 'AFC',
            HOU: 'AFC',
            MIA: 'AFC',
            PHI: 'NFC',
            CLE: 'AFC',
            CHI: 'NFC',
            IND: 'AFC',
            ATL: 'NFC',
            KC: 'AFC',
            NE: 'AFC',
            TEN: 'AFC',
            NYJ: 'AFC',
            BUF: 'AFC',
            SF: 'NFC',
            GB: 'NFC',
            TB: 'NFC',
            CAR: 'NFC',
            DET: 'NFC',
            STL: 'NFC',
            SD: 'AFC',
            OAK: 'AFC',
            BAL: 'AFC',
            CIN: 'AFC'
        },
        confToDiv = {
            AFC: ['AE', 'AN', 'AS', 'AW'],
            NFC: ['NE', 'NN', 'NS', 'NW']
        },
        divToTeam = {
            AE: ['NE', 'MIA', 'NYJ', 'BUF'],
            AN: ['BAL', 'PIT', 'CIN', 'CLE'],
            AS: ['HOU', 'IND', 'TEN', 'JAC'],
            AW: ['DEN', 'SD', 'OAK', 'KC'],
            NE: ['WAS', 'DAL', 'NYG', 'PHI'],
            NN: ['GB', 'MIN', 'CHI', 'DET'],
            NS: ['ATL', 'CAR', 'NO', 'TB'],
            NW: ['SF', 'SEA', 'STL', 'ARI']
        },
        confToTeam = {
            AFC: ['NE', 'MIA', 'NYJ', 'BUF', 'BAL', 'PIT', 'CIN', 'CLE', 'HOU', 'IND', 'TEN', 'JAC', 'DEN', 'SD', 'OAK', 'KC'],
            NFC: ['WAS', 'DAL', 'NYG', 'PHI', 'GB', 'MIN', 'CHI', 'DET', 'ATL', 'CAR', 'NO', 'TB', 'SF', 'SEA', 'STL', 'ARI']
        },
        dateRange = function (start, end) {
            var that = {};

            that.contains = function (date) {
                if (that.start <= date &&
                        that.end >= date) {
                    return true;
                }
                return false;
            };

            that.start = start;
            that.end = end;
        },
        preSeasonDates = {
            2011: dateRange(new Date(2011, 7, 11, 0, 0, 0, 0), new Date(2011, 8, 2, 23, 59, 59, 999)),
            2012: dateRange(new Date(2012, 7, 4, 0, 0, 0, 0), new Date(2012, 7, 30, 23, 59, 59, 999))
        },
        regSeasonDates = {
            2011: dateRange(new Date(2011, 8, 8, 0, 0, 0, 0), new Date(2012, 0, 1, 23, 59, 59, 999)),
            2012: dateRange(new Date(2012, 8, 5, 0, 0, 0, 0), new Date(2012, 11, 30, 23, 59, 59, 999))
        },
        playoffDates = {
            2011: dateRange(new Date(2012, 0, 7, 0, 0, 0, 0), new Date(2012, 1, 5, 23, 59, 59, 999)),
            2012: dateRange(new Date(2013, 0, 5, 0, 0, 0, 0), new Date(2013, 1, 3, 23, 59, 59, 999))
        };

    that.teamToDivision = function (shortname) {
        if (teamToDiv.hasOwnProperty(shortname)) {
            return teamToDiv[shortname];
        }
        throw new Error('No entry found for team ' + shortname + ' in division table');
    };

    that.teamToConference = function (shortname) {
        if (teamToConf.hasOwnProperty(shortname)) {
            return teamToConf[shortname];
        }
        throw new Error('No entry found for team ' + shortname + ' in conference table');
    };

    that.teamsOfDivision = function (division) {
        if (divToTeam.hasOwnProperty(division)) {
            return divToTeam[division];
        }
        throw new Error('No teams found in division ' + division);
    };

    that.teamsOfConference = function (conf) {
        if (confToTeam.hasOwnProperty(conf)) {
            return confToTeam[conf];
        }
        throw new Error('No teams found in conference ' + conf);
    };

    that.shortToLong = function (shortname) {
        if (shortToLong.hasOwnProperty(shortname)) {
            return shortToLong[shortname];
        }
        throw new Error('No entry for short name ' + shortname + ' found');
    };

    that.longToShort = function (longname) {
        if (longToShort.hasOwnProperty(longname)) {
            return longToShort[longname];
        }
        throw new Error('No entry for long name ' + longname + ' found');
    };

    return that;
}

exports.defs = defsModule();

