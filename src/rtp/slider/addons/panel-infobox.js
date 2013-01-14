/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panel Info Box Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Known problem: IE 6 does not like opacity on absolute positioned elements

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: toggleInfoBox @@@
	function toggleInfoBox (opacity, duration, position)
	{

		// create closure
		var slider = this;

		// check if queue is empty
		// if (slider.queue.length == 0)
		// {

			// get all panels for the current slide
			var panels = slider.getPanelsBySlide(position);

			// animate infoboxes of all panels by position
			jQuery('DIV.info', panels).each(function ()
			{

				// get local jQuery object
				var infobox= jQuery(this);

				// only animate if opacity is about to change
				if (infobox.css('opacity') != opacity)
				{

					// animate info box
					infobox.animate({

						// animate opacity
						opacity: opacity

					}, {

						// animation duration
						duration: duration,
						// unlock on complete
						complete: slider.lock()

					})
					// EO animate

				}
				// EO if opacity changes

			});
			// EO each panel

		// }
		// EO if empty queue

	}
	// @@@ EO private fn: toggleInfoBox @@@


	// @@@ plugin: swipeMove @@@
	prototype.plugin('swipeMove', function(x, y, data)
	{

		// only start animation once
		// but wait for actual first move
		// maybe really check for offset
		if (data.swipeMoves.length != 1) return;

		// hide the box very fast
		// we will be swiping around
		toggleInfoBox.call(this, 0, 300, data.swipeStartPosition);

	});
	// @@@ EO plugin: swipeMove @@@


	// @@@ plugin: abortAnimation @@@
	prototype.plugin('abortAnimation', function()
	{

		// abort the info box animations (if running)
		jQuery('DIV.info', this.panels).stop(true, true);

	});
	// @@@ EO plugin: abortAnimation @@@


	// show info boxes after the main animation ended (aquire locks)
	prototype.plugin('postAnimation', function() { toggleInfoBox.call(this, 1, 700, this.position) })

	// hide info boxes before the main animation started (aquire locks)
	prototype.plugin('preAnimation', function() { toggleInfoBox.call(this, 0, 700, this.position) })


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// first hide all infoboxes in all panels
		jQuery('DIV.info', this.panels).css({
			'opacity' : 0 // , 'zoom': 1
		});

		// get all panels for the current slide
		var panels = this.getPanelsBySlide(this.position);

		// init the current panel infoboxes to be shown
		jQuery('DIV.info', panels).css({
			'opacity' : 1 // , 'zoom': 1
		});

	}, - 9);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
