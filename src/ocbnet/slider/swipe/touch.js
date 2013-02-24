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


	// detect if we are an android device
	var android = navigator.userAgent.match(/Android/i);

	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// enable touch swipes
			touchSwipe : false

		});

	});
	// @@@ EO plugin: config @@@


	// some private functions usefull for callbacks
	var abort_handler = function(data, evt) { return false; }
	// var success_handler = function(data, evt) { return true; }


	// attach to event types
	var evt_stop = 'touchend';
	var evt_move = 'touchmove';
	var evt_start = 'touchstart';
	var evt_cancel = 'touchcancel';
	// var evt_abort = 'dragstart';

	function handleTouchChange (data, evt)
	{

		// return without aborting the event
		if (!this.conf.touchSwipe) return true;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    touch = changed[0] || touches[0],
		    swipe = vertical ? touch.clientY : touch.clientX,
		    scroll = vertical ? touch.clientX : touch.clientY;

		if (touches.length == 1)
		{

			// lock variable assertion
			if (data.toucher) return false;

			// unbind my move event handler when done
			if (data.move) jQuery(document).unbind(evt_move, data.move);

			for (var prop in data) { if (data.hasOwnProperty(prop)) { delete data[prop]; } }

			// get the point of interest
			data.toucher = touches[0];

		  swipe = vertical ? data.toucher.clientY : data.toucher.clientX,
		  scroll = vertical ? data.toucher.clientX : data.toucher.clientY;

			// create move event proxy function for this event
			data.move = jQuery.proxy(handleTouchMove, this, data);

			// call swipe start handler with coordinates
			this.trigger('swipeStart', swipe, scroll, data);

			// bind other event handlers
			if (data.move) jQuery(document).bind(evt_move, data.move);

			// if (data.false) jQuery(document).unbind(evt_move, data.false);

			return true;
		}

        if (touches.length == 0)
        {
            // unbind my move event handler when done
            if (data.move) jQuery(document).unbind(evt_move, data.move);

            // call swipe stop handler with coordinates
            this.trigger('swipeStop', swipe, scroll, data);
            for (var prop in data) { if (data.hasOwnProperty(prop)) { delete data[prop]; } }
        }
	}

	// @@@ private fn: handleMove @@@
	function handleTouchMove (data, evt)
	{

		// return without aborting the event
		if (!this.conf.touchSwipe) return true;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches,
		    changed = org.changedTouches;

		// normalize drag/scroll variable
		var touch = android ? touches[0] : data.toucher,
		    vertical = this.conf.vertical,
		    swipe = vertical ? touch.clientY : touch.clientX,
		    scroll = vertical ? touch.clientX : touch.clientY;

		// call swipe move handler with coordinates
		this.trigger('swipeMove', swipe, scroll, data, evt);

		// prevent default action if swiping
		if (data.swipeDrag) evt.preventDefault()

		// abort if swipe dragging
		return ! data.swipeDrag;

	};
	// @@@ EO private fn: handleMove @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// shared data
		var data = {};

		// capture the drag start event to disable other
		// handlers when the touch is dragged afterwards
		this.viewport.bind(evt_stop, jQuery.proxy(handleTouchChange, this, data));
		this.viewport.bind(evt_start, jQuery.proxy(handleTouchChange, this, data));
		this.viewport.bind(evt_cancel, jQuery.proxy(handleTouchChange, this, data));

	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);