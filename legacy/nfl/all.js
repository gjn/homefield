
var defs = require('./defs').defs;
var games = require('./games').games;
var parsers = require('./parsers').parsers;
var prf = require('./powerrankingflat').powerrankingflat;
var pr8 = require('./powerranking8games').powerranking8games;
var predictors = require('./predictors').predictors;
var backtesters = require('./backtesters').backtesters;

var nfl = {
    defs: defs,
    games: games,
    parsers: parsers,
    prf: prf,
    pr8: pr8,
    predictors: predictors,
    backtesters: backtesters
};

exports.nfl = nfl;

