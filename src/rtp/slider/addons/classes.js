/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panel Status Class Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

	To do: implement classes 'visible', 'hidden' and 'partial'

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// class for current panel
			curClass: false,

			// panel dead zone
			curClassDeadZone: 0.25

		});

		// marked elements store
		this.curEls = jQuery();

	});
	// @@@ EO plugin: config @@@


	// @@@ private fn: updateClasses @@@
	function updateClasses ()
	{

		// check if feature is enabled
		if (!this.conf.curClass) return;

		// get the current position
		var conf = this.conf,
		    curEls = jQuery(),
		    position = this.position,
		    curClass = conf.curClass,
		    deadZone = conf.curClassDeadZone;

		// get the nearest slide to be selected as current
		var nearest = this.slide2slide(parseInt(this.position + 0.5, 10));

		// mark current class if within dead zone
		if (Math.abs(nearest - position) < deadZone)
		{

			// get jQuery collection of current panels
			curEls = this.getPanelsBySlide(nearest);

			// have nav dots?
			if (this.navDot)
			{

				// add dom element of current nav dot
				curEls = curEls.add(this.navDot[nearest]);

			}
			// EO if navDot

		}
		// EO if in dead zone

		// add class to newly current elements
		curEls.not(this.curEls).addClass(curClass);

		// remove class from no longer current elements
		this.curEls.not(curEls).removeClass(curClass);

		// store current elements
		this.curEls = curEls;

	};
	// @@@ EO private fn: updateClasses @@@


	// reset the classes whenever the position changes
	prototype.plugin('changedPosition', updateClasses)
	prototype.plugin('layout', updateClasses)


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);