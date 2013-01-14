/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Auto Slide Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: init @@@
	prototype.plugin('config', function (extend)
	{

		// store autoslide timer
		// if autosliding is set to true it is paused and can
		// be restartet. if autosliding is false no auto slider
		// should be running, when running the timeout is stored
		this.autosliding = null;

		// add defaults
		extend({

			// start auto slide on load
			autoslide: false,
			// direction for autoslide
			autoslideAction: '+1',
			// delay for next slide
			autoslideDelay: 3500,
			// overwrite first slide delay
			autoslideFirstDelay : 1000,
			// overwrite resume slide delay
			autoslideResumeDelay : false,
			// stop autoslide on mouse over
			autoslideStopOnHover: false,
			// pause autoslide on mouse over
			// will resume on mouse out event
			autoslidePauseOnHover: true,
			// stop autoslide on manual interaction
			autoslideStopOnAction: false

		});
	
	});
	// @@@ EO plugin: init @@@


	// @@@ plugin: interaction @@@
	prototype.plugin('interaction', function()
	{


		// stop the autoslider if configured to do so
		if (this.conf.autoslideStopOnAction) this.stopAutoSlide(false);

	});
	// @@@ EO plugin: interaction @@@


	// @@@ plugin: stopAnimation @@@
	prototype.plugin('stopAnimation', function()
	{

		// return if autoslider is inactive
		if (!this.autosliding) return

		// only restart autoslider when
		// there are no more animation queued
		if (this.queue.length > 0) return;

		// restart autoslider with the default deay
		this.startAutoSlide(this.conf.autoslideDelay);

	});
	// @@@ EO plugin: stopAnimation @@@



	// @@@ method: startAutoSlide @@@
	prototype.startAutoSlide = function (delay, action)
	{

		if (isNaN(action)) action = '+1';

		// abort if autoslider timeout is waiting
		if (this.autosliding && this.autosliding !== true) return;

		this.autosliding = true;

		this.trigger('autoslideStart');

		if (this.queue.length > 0 || this.animating || this.locked) return;

		// setup and create new function to start autoslider
		this.autosliding = window.setTimeout(jQuery.proxy(function ()
		{

			if (this.queue.length > 0 || this.animating || this.locked) return;

			// if config option is a function, execute to get action
			if (jQuery.isFunction(action)) action = action.call(this);

				// get default action from given config
			if (isNaN(action)) action = this.conf.autoslideAction;

			// add action and start animation
			this.goTo(action);

			// autosliding has been activated
			this.autosliding = true;

		}, this), isNaN(delay) ? 0 : delay);

	}
	// @@@ EO method: startAutoSlide @@@


	// @@@ method: stopAutoSlide @@@
	prototype.stopAutoSlide = function (pause)
	{

		// abort if autoslider is not running
		// if (!this.autosliding) return;

		// a timeout has been stored
		if (this.autosliding !== true)
		{

			// clear the next autoslide timeout
			window.clearTimeout(this.autosliding)

		}

		// autosliding has been disabled
		this.autosliding = pause ? false : null;

		if (pause) this.trigger('autoslidePause');
		else this.trigger('autoslideStop');

	}
	// @@@ EO method: stopAutoSlide @@@


	// @@@ control autoslider [on/off, first timeout, action] @@@
	// prototype.autoslide = function ()
	// {

		// dispatch to start and stop functions
		// if (arguments.length > 0 && !arguments[0]) this.stopAutoSlide(false);
		// else this.startAutoSlide(arguments[1], arguments[2]);

	// }
	// @@@ EO autoslide @@@

	// @@@ plugin: start @@@
	prototype.plugin('start', function()
	{

		// abort if feature is not enabled
		if (!this.conf.autoslide) return;

		// maybe use special timeout for first auto slide
		var timeout = isNaN(this.conf.autoslideFirstDelay) ?
			this.conf.autoslideDelay : this.conf.autoslideFirstDelay;

		// call first autoslide with setting
		this.startAutoSlide(timeout);

	});
	// @@@ EO plugin: start @@@


	// @@@ plugin: ready @@@
	// start is defered after ready
	prototype.plugin('ready', function()
	{

		// pause auto slide if mouse is over the element
		// this option can only be enabled before ready event
		// if you intend to disable it on runtime, you must enable
		// it before this event, but you can then disable it on runtime
		this.wrapper.hover(

			// @@@ event: mouse in @@@
			jQuery.proxy(function ()
			{

				// check if autoslider is set to be running
				if (this.autosliding === null) return;

				// check options on runtime if autoslider should be stopped
				if(this.conf.autoslideStopOnHover) this.stopAutoSlide(false);
				else if(this.conf.autoslidePauseOnHover) this.stopAutoSlide(true);

			}, this),
			// @@@ EO event: mouse in @@@

			// @@@ event: mouse out @@@
			jQuery.proxy(function ()
			{

				// only do something if slider is paused
				if (this.autosliding !== false) return;

				// maybe use special timeout for resume auto slide
				var timeout = this.conf.autoslideResumeDelay != false ?
					this.conf.autoslideResumeDelay : this.conf.autoslideDelay;

				// restart autoslide on mouse out with optional timeout
				if(this.conf.autoslidePauseOnHover) this.startAutoSlide(timeout);

			}, this)
			// @@@ EO event: mouse out @@@

		);
		// EO hover

	});
	// @@@ EO plugin: ready @@@

	// start is defered after ready
	prototype.plugin('swipeStart', function()
	{
		this.backup = this.autosliding;
		if (this.autosliding)
		{
			this.stopAutoSlide(true);
		}
	});

	prototype.plugin('swipeStop', function()
	{
		if (this.backup)
		{
			this.startAutoSlide();
		}
	});

	// @@@ EO _init @@@
// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
