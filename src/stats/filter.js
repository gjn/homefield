hf.stats = hf.stats || {};

/*
 * Filter is used to filter a given
 * set based on a certain criteria.
 * Right now, the following is supported
 * DivsionFilters: only teams from a given divsion
 * ConferenceFilters: only teams from a given conference
 */
var Filter = function(s) {

  if (!(this instanceof Filter)) {
    return new Filter(s);
  }

  this.teamfilter = function(t) {
    if (hf.meta.teamToDivision(t) === s ||
        hf.meta.teamToConference(t) === s) {
      return true;
    }
    return false;
  }
  

};

hf.stats.Filter = Filter;

