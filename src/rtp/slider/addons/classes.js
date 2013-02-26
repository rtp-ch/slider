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
			curClass: 'current',

			// panel dead zone
			curClassDeadZone: 0.25

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ private fn: updateClasses @@@
	function updateClasses ()
		{

		// check if feature is enabled
		if (!this.conf.curClass) return;

		// get the current position
		var conf = this.conf,
		    position = this.position,
		    curClass = conf.curClass,
		    deadZone = conf.curClassDeadZone;

		// get the nearest panel to be select as current
		var nearest = parseInt(this.position + 0.5, 10);

		nearest = this.panel2panel(nearest);

		// remove current class on all panels
		this.panels.removeClass(curClass);

		// mark current class if within dead zone
		if (Math.abs(nearest - position) < deadZone)
		{

			if (this.navDot)
			{

				var idxs = this.slidepanels[nearest];

				jQuery(this.navDot).removeClass(curClass);

				var i = idxs.length; while (i--)
				{
					jQuery(this.navDot[idxs[i]])
						.addClass(curClass);
				}

			}

			this.getPanelsBySlide(nearest).addClass(curClass);

		}

	};
	// @@@ EO private fn: updateClasses @@@


	// reset the classes whenever the position changes
	prototype.plugin('layout', updateClasses)


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);