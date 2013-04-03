var TeamStat = function (o) {
    'use strict';

    if (!(this instanceof TeamStat)) {
        return new TeamStat(o);
    }

    var opts = o || {};
    //win/loss percentage
    this.winloss = opts.winloss;
    //points scored
    this.pts = opts.pts;
    //total yards
    this.yards = opts.yards;
    //turnovers
    this.to = opts.to;
    //first downs
    this.fd = opts.fd;
    //3rd down percentage
    this.tdp = opts.tdp;
    //rushing attempts
    this.ra = opts.ra;
    //rushin yards
    this.ry = opts.ry;
    //passing attempts
    this.pa = opts.pa;
    //completed passes
    this.pc = opts.pc;
    //passing years
    this.py = opts.py;
    //interceptions
    this.i = opts.i;
    //fumbles
    this.f = opts.f;
    //sacks
    this.s = opts.s;
    //sacks yards
    this.sy = opts.sy;
    //penalty yards
    this.peny = opts.peny;
    //time of possesion
    this.top = opts.top;
    //punting average yards
    this.punty = opts.punty;
};

var TeamOffDefStat = function (o, d) {
    'use strict';

    if (!(this instanceof TeamOffDefStat)) {
        return new TeamOffDefStat(o, d);
    }

    var off = o || {},
        def = d || {};

    this.off = new TeamStat(off);
    this.def = new TeamStat(def);
};

var TeamWithOppStat = function (s, o) {
    'use strict';

    if (!(this instanceof TeamWithOppStat)) {
        return new TeamWithOppStat(s, o);
    }

    var stat = s || {},
        opp = o || {};

    this.stat = new TeamOffDefStat(stat.off, stat.def);
    this.oppstat = new TeamOffDefStat(opp.off, opp.def);
};

module.exports = {
    TeamStat: TeamStat,
    TeamOffDefStat: TeamOffDefStat,
    TeamWithOppStat: TeamWithOppStat
};

