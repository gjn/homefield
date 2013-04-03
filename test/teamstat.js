var test = require('tap').test;
var teamstat = require('../lib/teamstat').TeamStat;
var offdef = require('../lib/teamstat').TeamOffDefStat;

test('teamstat creation', function (t) {
    'use strict';
    var newTeamStat = teamstat();
    t.deepEqual(newTeamStat.wl, undefined);
    t.deepEqual(newTeamStat.opp, undefined);

    var opts = {
        py: 200,
        dummy: 'mystring'
    };

    var another = teamstat(opts);
    t.deepEqual(another.py, 200);
    t.deepEqual(another.dummy, undefined);
    t.deepEqual(another.opp, undefined);

    opts.py = 300;

    var yetanother = new teamstat(opts);
    t.deepEqual(yetanother.py, 300);
    t.deepEqual(yetanother.dummy, undefined);
    t.deepEqual(yetanother.opp, undefined);

    var myoffdef = offdef();
    t.deepEqual(myoffdef.off.py, undefined);
    t.deepEqual(myoffdef.def.py, undefined);

    myoffdef = offdef(another);
    t.deepEqual(myoffdef.off.py, 200);
    t.deepEqual(myoffdef.def.py, undefined);

    myoffdef = offdef(another, yetanother);
    t.deepEqual(myoffdef.off.py, 200);
    t.deepEqual(myoffdef.def.py, 300);

    myoffdef = offdef(null, another);
    t.deepEqual(myoffdef.off.py, undefined);
    t.deepEqual(myoffdef.def.py, 200);


    t.end();
});



