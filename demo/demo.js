/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP Slider Demo
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

var slider;

function conf (str)
{
	if (typeof str == 'number') return str;
	if (typeof str == 'undefined') return null;
	if (str.match(/^\s*null\s*$/i)) return null;
	if (str.match(/^\s*true\s*$/i)) return true;
	if (str.match(/^\s*false\s*$/i)) return false;
	return str;
}

jQuery(function()
{

	// take some arguments from the query string
	var query = URI.parseQuery(document.location.search);

	var config = {

		// text/html for the previous link
		navArrowPrevText: '<img src="img/left.gif" alt="left">',
		// text/html for the next link
		navArrowNextText: '<img src="img/right.gif" alt="left">',

		sizer: conf(query.sizer),
		align: parseFloat(conf(query.align)),

		swipe: conf(query.swipe) ? true : false,
		touchSwipe : conf(query.touchSwipe) ? true : false,
		mouseSwipe : conf(query.mouseSwipe) ? true : false,

		// show nav dots
		navDots: conf(query.navDots) ? true : false,
		navArrows: conf(query.navArrows) ? true : false,
		navToolbar: conf(query.navToolbar) ? true : false,
		navKeyboard: conf(query.navKeyboard) ? true : false,
		vertical: conf(query.vertical) ? true : false,
		carousel: conf(query.carousel) ? true : false,
		carousel3d: conf(query.carousel3d) ? true : false,
		autoslide: conf(query.autoslide) ? true : false,
		fillViewport : conf(query.fillViewport) ? true : false,
		shrinkViewport : conf(query.shrinkViewport) ? true : false,

		// direction for autoslide
		autoslideAction: conf(query.autoslideAction),
		// delay for next slide
		autoslideDelay: conf(query.autoslideDelay),
		// overwrite first slide delay
		autoslideFirstDelay : conf(query.autoslideFirstDelay),
		// overwrite resume slide delay
		autoslideResumeDelay : conf(query.autoslideResumeDelay),
		// stop autoslide on mouse over
		autoslideStopOnHover: conf(query.autoslideStopOnHover) ? true : false,
		// pause autoslide on mouse over
		// will resume on mouse out event
		autoslidePauseOnHover: conf(query.autoslidePauseOnHover) ? true : false,
		// stop autoslide on manual interaction
		autoslideStopOnAction: conf(query.autoslideStopOnAction) ? true : false,

		slideFirst: parseFloat(conf(query.slideFirst || 0), 10),
		panelsVisible: parseFloat(conf(query.panelsVisible), 10),

		fps: 25,
		hooks:
		{
			'ready': function() { }
		},
		vsync : true,
		setFloat: true,
		autoVpOpp : true,
		preferScrollbar: 1,
		firstSlideToLoad: 0

	}

	// initialize the slider
	jQuery('DIV.rtp-slider-viewport').rtpSlider(config)

	// get slider object from attached data
	slider = jQuery('DIV.rtp-slider-viewport').data('rtp-slider');

});

var confwin;

function setConfigurator (win)
{
	win.init(slider);
}

function configurator ()
{

	self.name = "rtp-slider";

	var options = 'location=0, status=0, scrollbars=0, width=220, height=600';

	if (!confwin || confwin.closed)
	{
		confwin = window.open ('/slider/demo/configurator.html', 'configurator', options);
		if (confwin.init) confwin.init(slider);
		confwin.focus();
	}
	else if (confwin.init)
	{
		confwin.init(slider);
		confwin.focus();
	}

}