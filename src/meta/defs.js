
var Defs = function () {
  'use strict';
  var longToShort = {
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
          DAL: 'NFCE',
          NYG: 'NFCE',
          DEN: 'AFCW',
          PIT: 'AFCN',
          ARI: 'NFCW',
          SEA: 'NFCW',
          WAS: 'NFCE',
          NO: 'NFCS',
          MIN: 'NFCN',
          JAC: 'AFCS',
          HOU: 'AFCS',
          MIA: 'AFCE',
          PHI: 'NFCE',
          CLE: 'AFCN',
          CHI: 'NFCN',
          IND: 'AFCS',
          ATL: 'NFCS',
          KC: 'AFCW',
          NE: 'AFCE',
          TEN: 'AFCS',
          NYJ: 'AFCE',
          BUF: 'AFCE',
          SF: 'NFCW',
          GB: 'NFCN',
          TB: 'NFCS',
          CAR: 'NFCS',
          DET: 'NFCN',
          STL: 'NFCW',
          SD: 'AFCW',
          OAK: 'AFCW',
          BAL: 'AFCN',
          CIN: 'AFCN'
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
      /*
      confToDiv = {
          AFC: ['AFCE', 'AFCN', 'AFCS', 'AFCW'],
          NFC: ['NFCE', 'NFCN', 'NFCS', 'NFCW']
      },
      */
      divToTeam = {
          AFCE: ['NE', 'MIA', 'NYJ', 'BUF'],
          AFCN: ['BAL', 'PIT', 'CIN', 'CLE'],
          AFCS: ['HOU', 'IND', 'TEN', 'JAC'],
          AFCW: ['DEN', 'SD', 'OAK', 'KC'],
          NFCE: ['WAS', 'DAL', 'NYG', 'PHI'],
          NFCN: ['GB', 'MIN', 'CHI', 'DET'],
          NFCS: ['ATL', 'CAR', 'NO', 'TB'],
          NFCW: ['SF', 'SEA', 'STL', 'ARI']
      },
      confToTeam = {
          AFC: ['NE', 'MIA', 'NYJ', 'BUF', 'BAL', 'PIT', 'CIN', 'CLE', 'HOU', 'IND', 'TEN', 'JAC', 'DEN', 'SD', 'OAK', 'KC'],
          NFC: ['WAS', 'DAL', 'NYG', 'PHI', 'GB', 'MIN', 'CHI', 'DET', 'ATL', 'CAR', 'NO', 'TB', 'SF', 'SEA', 'STL', 'ARI']
      },
      // Colors from http://teamcolors.arc90.com/
      teamToColor = {
        ARI: ["870619", "000000", "FFFFFF"],
        ATL: ["BD0D18", "000000", "FFFFFF", "DCE0E5"],
        BAL: ["280353", "000000", "D0B240", "FFFFFF"],
        BUF: ["00338D", "C60C30", "FFFFFF"],
        CAR: ["000000", "0088CE", "A5ACAF", "FFFFFF"],
        CHI: ["03202F", "DD4814", "FFFFFF"],
        CIN: ["000000", "FB4F14", "FFFFFF"],
        CLE: ["26201E", "E34912", "FFFFFF"],
        DAL: ["002244", "8C8B8A", "FFFFFF"],
        DEN: ["FB4F14", "002244", "FFFFFF"],
        DET: ["006DB0", "C5C7CF", "000000", "FFFFFF"],
        GB: ["213D30", "FFCC00"],
        HOU: ["02253A", "B31B34", "FFFFFF"],
        IND: ["003B7B", "FFFFFF"],
        JAC: ["000000", "D0B239", "007198", "FFFFFF"],
        KC: ["B20032", "F2C800"],
        MIA: ["008d97", "015679", "FFFFFF", "F5811F"],
        MIN: ["4F2682", "FFC52F", "FFFFFF"],
        NE: ["0D254C", "D6D6D6", "C80815", "FFFFFF"],
        NO: ["D2B887", "000000", "FFFFFF"],
        NYG: ["192F6B", "CA001A", "FFFFFF", "808080"],
        NYJ: ["0C371D", "FFFFFF"],
        OAK: ["C4C8CB", "000000", "FFFFFF"],
        PHI: ["003B48", "000000", "708090", "C0C0C0", "FFFFFF"],
        PIT: ["000000", "F2C800", "FFFFFF"],
        SD: ["08214A", "EEC607", "5B92E5", "FFFFFF"],
        SF: ["AF1E2C", "E6BE8A", "000000"],
        SEA: ["06192E", "4EAE47", "ACB6BC", "FFFFFF"],
        STL: ["13264B", "C9AF74", "FFFFFF"],
        TB: ["D60A0B", "89765F", "000000", "FFFFFF", "FF7A00"],
        TEN: ["648FCC", "000080", "FF0000", "C0C0C0"],
        WAS: ["773141", "FFB612", "FFFFFF"]
      };
      /*
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
      };*/

  this.teamToDivision = function (shortname) {
      if (teamToDiv.hasOwnProperty(shortname)) {
          return teamToDiv[shortname];
      }
      throw new Error('No entry found for team ' + shortname + ' in division table');
  };

  this.teamToConference = function (shortname) {
      if (teamToConf.hasOwnProperty(shortname)) {
          return teamToConf[shortname];
      }
      throw new Error('No entry found for team ' + shortname + ' in conference table');
  };

  this.teamsOfDivision = function (division) {
      if (divToTeam.hasOwnProperty(division)) {
          return divToTeam[division];
      }
      throw new Error('No teams found in division ' + division);
  };

  this.teamsOfConference = function (conf) {
      if (confToTeam.hasOwnProperty(conf)) {
          return confToTeam[conf];
      }
      throw new Error('No teams found in conference ' + conf);
  };

  this.shortToLong = function (shortname) {
      if (shortToLong.hasOwnProperty(shortname)) {
          return shortToLong[shortname];
      }
      throw new Error('No entry for short name ' + shortname + ' found');
  };

  this.longToShort = function (longname) {
      if (longToShort.hasOwnProperty(longname)) {
          return longToShort[longname];
      }
      throw new Error('No entry for long name ' + longname + ' found');
  };

  this.teamColor = function (team, level) {
    if (teamToColor.hasOwnProperty(team)) {
      var colors = teamToColor[team];
      level = level < 0 ? 0 : level >= colors.length ? colors.length - 1 : level;
      return colors[level];
    }
    throw new Error('No color defined for ' + team + '.');
  };

  this.teamsAsObject = function() {
    return shortToLong;
  };

  this.statName = function(s, o) {
    var name = 'Unknown';
    if (s == 'w') {
      name = 'Win Rate';
    } else if (s == 'p') {
      name = 'Points';
    } else if (s == 'y') {
      name = 'Yards';
    } else if (s == 't') {
      name = 'Turnovers';
    }
    if (o == 'u') {
      name += ' Differential';
    }
    return name;

  }
};

var instance = null;

var getInstance = function() {
  'use strict';
  if (instance === null) {
      instance = new Defs();
  }
  return instance;
};

hf.meta = hf.meta || getInstance();
