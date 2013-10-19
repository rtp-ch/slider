/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP Slider Demo
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

function conf (str)
{
	if (typeof str == 'number') return str;
	if (typeof str == 'undefined') return null;
	if (str.match(/^\s*null\s*$/i)) return null;
	if (str.match(/^\s*true\s*$/i)) return true;
	if (str.match(/^\s*false\s*$/i)) return false;
	return str;
}

function floated (str)
{
	if (typeof str == 'number') return parseFloat(str);
	if (typeof str == 'undefined') return 0;
	if (str === null) return 0;
	if (str === true) return true;
	if (str === false) return false;
	if (str.match(/^\s*null\s*$/i)) return 0;
	if (str.match(/^\s*true\s*$/i)) return true;
	if (str.match(/^\s*false\s*$/i)) return false;
	return parseFloat(str);
}

jQuery(function()
{

	// take some arguments from the query string
	var query = URI.parseQuery(document.location.search);

	var config = {

		setFloat: true,
		curClass: false,

		// text/html for the previous link
		navArrowPrevText: '<img src="img/left.gif" alt="left">',
		// text/html for the next link
		navArrowNextText: '<img src="img/right.gif" alt="left">',

		hooks: { 'ready': function() { } }

	};

	for (var i in checkboxes)
	{
		var id = checkboxes[i];
		if (id in query) config[id] = conf(query[id]) ? true : false;
	}

	for (var i in floats)
	{
		var id = floats[i];
		if (id in query) config[id] = floated(conf(query[id]));
	}

	for (var i in selects)
	{
		var id = selects[i];
		if (id in query) config[id] = conf(query[id]);
	}

	// initialize the slider
	slider = jQuery('DIV.rtp-slider-viewport')
	         .rtpSlider(config).data('rtpSlider');

});

var confwin;

function setConfigurator (init)
{
	init(slider);
}

function configurator ()
{

	// name our own window
	self.name = "rtpslider";

	if (!confwin || confwin.closed)
	{
		// options for the popup window (modal dialog)
		var options = 'location=0, status=0, scrollbars=1, width=280, height=560';
		// open a new popup window (connect and update afterwards)
		confwin = window.open ('configurator.html', 'configurator', options);
	}

	if (confwin.init)
	{
		confwin.init(slider);
		confwin.focus();
	}

}
