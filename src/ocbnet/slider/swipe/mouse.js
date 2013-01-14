/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Mouse Swipe Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

	A swipe gesture is always generated with a start, several move and a stop event.
	From these events we calculate the speed of the cursor/finger when the event is triggered.

	Known problems:
	 - MouseUp event is not fired when some element is dragged, then the mouse
	   moves outside the window and is then released -> http://jsfiddle.net/hL3mg/8/

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

			// enable mouse swipes
			mouseSwipe : false

		});

	});
	// @@@ EO plugin: config @@@


	// some private functions usefull for callbacks
	// var abort_handler = function(data, evt) { return false; }
	// var success_handler = function(data, evt) { return true; }


	// attach to event types
	var evt_stop = 'mouseup';
	var evt_move = 'mousemove';
	var evt_start = 'mousedown';
	// var evt_abort = 'dragstart';


	// @@@ private fn: start_handler @@@
	var start_handler = function (data, evt)
	{

		// return without aborting the event
		if (!this.conf.mouseSwipe) return true;

		// check for the correct button
		if (evt.which !== 1) return true;

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? evt.pageY : evt.pageX,
		    scroll = vertical ? evt.pageX : evt.pageY;

		// call swipe start handler with coordinates
		this.trigger('swipeStart', swipe, scroll, data);

		// create the event proxy function for this event
		data.end = jQuery.proxy(end_handler, this, data);
		data.move = jQuery.proxy(move_handler, this, data);
		// data.abort = jQuery.proxy(abort_handler, this, data);

		// bind other event handlers
		jQuery(document).bind(evt_stop, data.end);
		jQuery(document).bind(evt_move, data.move);
		// jQuery(document).bind(evt_abort, data.abort);

		// let the event do its work
		return false;

	};
	// @@@ EO private fn: start_handler @@@


	// @@@ private fn: move_handler @@@
	var move_handler = function (data, evt)
	{

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? evt.pageY : evt.pageX,
		    scroll = vertical ? evt.pageX : evt.pageY;

		// call swipe move handler with coordinates
		this.trigger('swipeMove', swipe, scroll, data, evt);

		// abort if swipe dragging
		return ! data.dragSwipe;

	};
	// @@@ EO private fn: move_handler @@@


	// @@@ private fn: end_handler @@@
	var end_handler = function(data, evt)
	{

		// unbind my event handlers when done
		// jQuery(document).unbind(evt_abort, data.abort);
		jQuery(document).unbind(evt_move, data.move);
		jQuery(document).unbind(evt_stop, data.end);

		// reset to avoid memory leak (play safe)
		data.end = data.move = data.start = null;

		// normalize drag/scroll variable
		var vertical = this.conf.vertical,
		    swipe = vertical ? evt.pageY : evt.pageX,
		    scroll = vertical ? evt.pageX : evt.pageY;

		// call swipe stop handler with coordinates
		this.trigger('swipeStop', swipe, scroll, data);

		// abort event
		return ! data.dragSwipe;

	};
	// @@@ EO private fn: end_handler @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// create closure data
		var data = {};

		// capture the drag start event to disable other
		// handlers when the mouse is dragged afterwards
		this.viewport.bind(evt_start, jQuery.proxy(start_handler, this, data));

	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
