/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Touch Swipe Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  A swipe gesture is always generated with a start, several move and a stop event.
  From these events we calculate the speed of the cursor/finger when the event is triggered.

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

			// enable touch swipes
			gestureSwipe : false

		});

	});
	// @@@ EO plugin: config @@@

	// @@@ private fn: stop_handler @@@
	var stop_handler = function (data, evt)
	{

		// return without aborting the event
		if (!this.conf.gestureSwipe) return true;

		// retrieve from event
		var finger = evt.finger,
		    gesture = evt.gesture;

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? finger.y : finger.x,
		    scroll = vertical ? finger.x : finger.y;

		// call swipe start handler with coordinates
		this.trigger('swipeStop', swipe, scroll, data);

	}
	// @@@ EO private fn: stop_handler @@@

	// @@@ private fn: move_handler @@@
	var move_handler = function (data, evt)
	{

		// return without aborting the event
		if (!this.conf.gestureSwipe) return true;

		// retrieve from event
		var finger = evt.finger,
		    gesture = evt.gesture;

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? finger.y : finger.x,
		    scroll = vertical ? finger.x : finger.y,
		    swipeOff = vertical ? evt.dy : evt.dx,
		    scrollOff = vertical ? evt.dx : evt.dy;

		// call swipe start handler with coordinates
		this.trigger('swipeMove', swipe, scroll, data, swipeOff, scrollOff);

		if(!data.swipeDrag)
		{
				evt.stopPropagation();
				return;
		}

		if(!this.conf.carousel)
		{
			// console.log(this.viewport.get(0).id, swipe, data.position, this.position);
			if (data.position === this.position && (this.position == 0 || this.position == this.smax))
			{
				// data.swipeStartDrag = swipe;
				// data.swipeStartScroll = scroll;
				// delete data.swipeFirstDrag;
			}
			else
			{
				// console.log('stop');
				evt.stopPropagation();
			}
		}
		else
		{
			evt.stopPropagation();
		}


		// remember last position
		data.position = this.position;

	}
	// @@@ EO private fn: move_handler @@@

	// @@@ private fn: start_handler @@@
	var start_handler = function (data, evt)
	{

		// return without aborting the event
		if (!this.conf.gestureSwipe) return true;

		// retrieve from event
		var finger = evt.finger,
		    gesture = evt.gesture;

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? finger.y : finger.x,
		    scroll = vertical ? finger.x : finger.y;

		// call swipe start handler with coordinates
		this.trigger('swipeStart', swipe, scroll, data);

	}
	// @@@ EO private fn: start_handler @@@

	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// shared data
		var data = {};

		// setup viewport
		this.viewport

			// enable gestures
			.gesture({
				native:
				{
					panY : ! this.conf.vertical,
					panX : !! this.conf.vertical
				}
			})
			.bind('handmove', function (evt)
			{
				// evt.stopPropagation();
				// evt.preventDefault();
			})

			// bind event listeners and create instance closures
			.bind('handstop', jQuery.proxy(stop_handler, this, data))
			.bind('handmove', jQuery.proxy(move_handler, this, data))
			.bind('handstart', jQuery.proxy(start_handler, this, data))

			.bind('handstart', function (evt)
			{
				if (evt.gesture.fingers == 0)
				{
					// evt.stopPropagation();
				}
				if (evt.gesture.fingers == 1)
				{
					evt.preventDefault();
				}

			})



	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);

/*


*/