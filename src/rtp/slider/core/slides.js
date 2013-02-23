/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Slides Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// these method are not available to panels as
	// we have to make sure that cloned panels have
	// exactly the same size as the original panel
	// set the outer dimension of the slide panel

	// @@@ method: setSlideDim @@@
	prototype.setSlideDim = function (slide, outerdim)
	{
		this.setSlideSize(slide, outerdim, 0);
	}
	// @@@ EO method: setSlideDim @@@

	// @@@ method: setSlideOpp @@@
	prototype.setSlideOpp = function (slide, outerdim)
	{
		this.setSlideSize(slide, outerdim, 1);
	}
	// @@@ EO method: setSlideOpp @@@

	// @@@ method: setSlideSize @@@
	prototype.setSlideSize = function (slide, outerdim, invert)
	{

		// declare loop variables
		var outer = this.pd[invert],
		    inner = this.ps[invert],
		    layout = this.pl[invert],
		    border = this.pb[invert],
		    margin = this.pm[invert],
		    padding = this.pp[invert];

		// normalize the input variable
		slide = this.slide2slide(slide);

		// get array with all panels for slide
		// contains only indexes and not objects
		var panels = this.slidepanels[slide];

		// process original and cloned panels for slide
		var i = panels.length; while (i--)
		{

			// get the index from slidepanels and panel
			var p = panels[i], panel = this.panels[p];

			// get sizing difference (is normalized to content box)
			var boxdiff = margin[p][2] + border[p][2] + padding[p][2];

			// we cannot have a negative outer size
			if (outerdim < boxdiff) outerdim = boxdiff;

			// update inner dimension of panel
			var innerdim = outerdim - boxdiff;

			// update outer dimension of panel
			this.pd[invert][p] = outerdim;

			// update inner dimension of panel
			this.ps[invert][p] = innerdim;

			// adjust for box sizing layout
			// if (layout[i] == 'content-box')
			// { innerdim += padding[i][2]; }
			// else if (layout[i] == 'border-box')
			// { innerdim += padding[i][2] + border[i][2]; }

			// update the panel size in dom
			if (this.conf.vertical ^ invert)
			{ jQuery(panel).height(innerdim); }
			else { jQuery(panel).width(innerdim); }

		}
		// EO each panel

	}
	// @@@ EO method: setSlideSize @@@


	// @@@ method: getPanelsBySlide @@@
	// slidepanel does only store indexes
	// return the actual panel jquery nodes
	prototype.getPanelsBySlide = function (slide)
	{

		// parse into integer
		slide = parseInt(slide + 0.5, 10);

		// normalize the input variable
		slide = this.slide2slide(slide);

		// get array copy with all panels for slide
		var panels = this.slidepanels[slide].slice();

		// get the actual panel dom nodes
		var i = panels.length; while (i--)
		{ panels[i] = this.panels[panels[i]]; }

		// return collection
		return jQuery(panels);

	}
	// @@@ EO method: getPanelsBySlide @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
