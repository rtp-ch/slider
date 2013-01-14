/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Animation Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// store jquery animation
		this.animating = false;

		// animation queue
		this.queue = [];

		// add defaults
		extend({

			// easing duration per slide
			easeDuration: 1200,
			// easing function per step
			easeFunction: 'easeInOutExpo'

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ method: lock @@@
	// lock the slider for custom animation
	// returns a function you have to call
	// when your own animation is complete
	prototype.lock = function()
	{

		// create closure
		var slider = this;

		// check if slider is locked
		if (slider.locked)
		{

			// return another prerequisite to satisfy
			return slider.locked.prerequisite();

		}

		// when swiping the custom animation
		// should run freely without lock
		if (slider.swiping) return;

		// create resume function / closure
		var resume = jQuery.proxy(slider.resume, slider);

		// reset the resume callback
		// I did already consume it
		slider.resume = false;

		// return lexical function
		slider.locked = new RTP.Multievent(function ()
		{

			// check if we are already animating
			// this should not happend, safety first
			if (slider.animating) return;

			// unlock the slider
			slider.locked = false;

			// only call once
			if (!resume) return;

			// execute resume
			resume.call(slider)

			// reset callback
			resume = null;

		});
		// EO multievent cb

		// create a new prerequisite to satisfy
		return slider.locked.prerequisite();

	};
	// @@@ EO method: lock @@@


	// @@@ private fn: enqueue @@@
	var enqueue = function (action, duration, easing, cb, keep)
	{

		// create closure
		var slider = this;

		// enqueue action
		slider.queue.push({

			keep: keep,
			action: action,
			easing: easing || this.conf.easeFunction,
			duration: isNaN(duration) ? this.conf.easeDuration : duration,
			step: function () { step.call(slider, this); },
			complete: function ()
			{
				if(cb) cb.call(slider, this);
				complete.call(slider, this);
			}

		});

	}
	// @@@ EO private fn: enqueue @@@


	// @@@ private fn: actionToPosition @@@
	function actionToPosition (action)
	{

		// local variable
		var pos;

		// convert to next/prev action
		if (action.toString().match(/^([\+\-])/))
		{
			// add parsed number to current position
			pos = this.position + parseFloat(action);
		}
		// absolute position
		else
		{
			// return parsed number
			pos = parseFloat(action);
		}

		// return normalized value if not in carousel mode
		return this.conf.carousel ? pos : this.panel2panel(pos);

	}
	// @@@ EO private fn: actionToPosition @@@


	// @@@ private fn: dequeue @@@
	var dequeue = function (animation)
	{
		// get animation lock
		this.animating = true;

		// get the enqueued animation
		var action = animation.action,
		    position = this.position,
		    from = { pos: position };

		// get the absolute position for this action
		var pos = actionToPosition.call(this, action);

		// check if we are already on position
		if (pos == position)
		{
			// execute complete callback and return
			return animation.complete.call({ pos : pos });
		}

		// search for shortest path
		if (this.conf.carousel && ! animation.keep)
		{
			var diff = Math.abs(position - pos),
			    left_pos = pos - this.slides.length,
			    right_pos = pos + this.slides.length;
			if (diff > Math.abs(left_pos - position)) pos = left_pos;
			if (diff > Math.abs(right_pos - position)) pos = right_pos;
		}

		// start the jQuery animation that drives our animation
		this.animating = jQuery(from).animate({ pos : pos }, animation);

	};
	// @@@ EO private fn: dequeue @@@


	// @@@ private fn: abort @@@
	prototype.abortAnimation = function ()
	{

		// reset queued animations
		this.queue.length = 0;

		// stop all queued custom jquery animations
		if (this.animating && this.animating !== true)
		{
			// this.trigger('stopAnimation');
			this.animating.stop(true, false);
		}

		// release all animation locks
		this.animating = this.locked = false;

	}
	// @@@ EO private fn: abort @@@

	// @@@ private fn: start @@@
	var start = function ()
	{

		// check if some animation is running
		if (this.animating || this.locked) return;

		// check if there is anything queued
		if (this.queue.length == 0) return;

		// shift next animation step to do
		var animation = this.queue.shift();

		// register resume function for lockers
		// the lock method will take care
		// to attach this function to the right context
		this.resume = function ()
		{

			// now trigger the startAnimation hook
			this.trigger('startAnimation');

			// start dequeuing next action
			// preAnimation hook has completed
			dequeue.call(this, animation);

			// reset our resumer
			this.resume = null;

		}
		// EO fn resume

			// get the absolute position for this action
			var pos = actionToPosition.call(this, animation.action);

		// now trigger the preAnimation hook
		// this might lock the animation which
		if (pos != this.position) this.trigger('preAnimation');

		// call resume now if not locked and still defined
		if (this.resume && !this.locked) this.resume.call(this);

	};
	// @@@ EO private fn: start @@@


	// @@@ private fn: complete @@@
	var complete = function (to)
	{

		// release animation lock
		this.animating = false;

		// move slider to final position
		this.setPosition(to.pos);

		// register resume function for lockers
		// the lock method will take care
		// to attach this function to the right context
		this.resume = function ()
		{

			// now trigger the endAnimation hook
			this.trigger('stopAnimation');

			// re-start the queue, do next
			// postAnimation hook has completed
			start.call(this);

			// reset our resumer
			this.resume = null;

		};
		// EO fn resume

		if (this.queue.length == 0)
		{
			// now trigger the postAnimation hook
			// this might lock the animation which
			this.trigger('postAnimation');
		}

		// call resume now if not locked and still defined
		if (this.resume && !this.locked) this.resume.call(this);

	};
	// @@@ EO private fn: complete @@@


	// @@@ private fn: step @@@
	var step = function (cur)
	{

		// move slider to position
		this.setPosition(cur.pos);

	};
	// @@@ EO private fn: step @@@


	// @@@ method: animate @@@
	prototype.animate = function (action, duration, easing, cb, keep)
	{

		// if config option is a function, execute to get action
		if (jQuery.isFunction(action)) action = action.call(this);

		// trigger interaction hook
		this.trigger('interaction', action);

		// add action to the queue
		enqueue.apply(this, arguments);

		// start the queue
		start.call(this);

	};
	// @@@ EO method: animate @@@


	// @@@ method: animate @@@
	prototype.goTo = function (action, duration, easing, cb, keep)
	{

		// if config option is a function, execute to get action
		if (jQuery.isFunction(action)) action = action.call(this);

		// add action to the queue
		enqueue.apply(this, arguments);

		// start the queue
		start.call(this);

	};
	// @@@ EO method: animate @@@


	// shortcut methods for common animations
	prototype.goNext = function (delay, easing) { this.animate('+1', delay, easing); }
	prototype.goPrev = function (delay, easing) { this.animate('-1', delay, easing); }
	prototype.goFirst = function (delay, easing) { this.animate('0', delay, easing); }
	prototype.goLast = function (delay, easing) { this.animate(this.slen - 1, delay, easing); }


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
