/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider 0.9.0
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.


*/

/*

  Copyright (c) Marcel Greter 2012 - OCBNET Layouter 1.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

  The Layouter takes care of widgets that have aspect ratios.
  These Widgets can run into problem when the scrollbar appears.
  This lib does the same as any (tested) browser does when displaying
  images with an aspect ratio and a flexible width. When the vertical
  scrollbar appears due to the widget/image beeing to tall, the width
  of the widget would be decreased which in turn decreases the height.
  This then can make the scrollbar to disapear again, which in turn
  would increase the width and height of the widget again. To solve
  this endless loop, we force a vertical scrollbar to be shown.

  This fixes layout and scrollbar problems like these:
  http://stackoverflow.com/questions/6818096

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// jquery win and body object
	// body will be set when the first
	// widget is added to the collection
	var win = jQuery(window), body = null;

	// store scheduled timeout
	var scheduled;

	// widgets to be layouted
	var widgets = jQuery();

	// old body overflow style
	var overflow_x, overflow_y;

	// defer the resize event and filter multiple calls
	// this is a bugfix for ie 8 where the resize event may is
	// triggered multiple times when scrollbars appear/disappear
	var resize_defer = jQuery.browser.msie &&
		parseInt(jQuery.browser.version, 10) == 8;

	// get firefox mode on startup / initialization
	// firefox will show both scrollbars when the layout
	// does not 'fit' perfectly. All other browsers will
	// only show the scrollbar in the direction needed.
	var firefox_overflow = jQuery.browser.mozilla;

	// use requestAnimationFrame to defer functions
	// this seems to work quite well, so include it
	var setDefered = window.requestAnimationFrame,
	    clearDefered = window.cancelRequestAnimationFrame;
	// search for requestAnimationFrame by vendor
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	// loop vendors until the request animation frame function is found
	for(var x = 0; x < vendors.length && !setDefered; ++x)
	{
		setDefered = window[vendors[x]+'RequestAnimationFrame'];
		clearDefered = window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	// create function to take out delay argument
	if (setDefered) var callDefered = function (cb) { setDefered(cb); };

	// use timeouts as a fallback
	if (!callDefered) callDefered = window.setTimeout;
	if (!clearDefered) clearDefered = window.clearTimeout;


	// static local function
	// call function on all widgets
	function exec(fn, data)
	{

		// loop all widgets reversed
		var i = widgets.length; while (i--)
		{

			// get local variables
			var widget = widgets[i];
			var method = widget[fn];

			// call the method in context of the widget
			if (jQuery.isFunction(method)) method.call(widget, data);

		}

	}
	// EO exec


	// static local function
	// call layout hooks on all widgets
	function layout (data)
	{

		exec('preLayout', data);
		exec('updateLayout', data);
		exec('postLayout', data);

	}
	// EO layout


	// static global function
	// do the layout on all widgets
	function Manager (force)
	{

		// shared data (assign flag)
		var data = { force: force };

		// restore the previous overflow style on the document body
		// needed so our layout can trigger the scrollbar to appear/disapear
		if (overflow_y) { body.css('overflow-y', overflow_y); overflow_y = null; }
		if (overflow_x) { body.css('overflow-x', overflow_x); overflow_x = null; }

		// get the initial dimensions
		var body_1st_x = win.innerWidth();
		var body_1st_y = win.innerHeight();

		// reflow layout
		layout(data);

		// get the dimensions afterwards
		var body_2nd_x = win.innerWidth();
		var body_2nd_y = win.innerHeight();

		if (body_1st_x != body_2nd_x || body_1st_y != body_2nd_y)
		// if (body_1st_x > body_2nd_x || body_1st_y > body_2nd_y)
		{

			// reflow layout
			layout(data);

			// get the dimensions afterwards
			var body_3rd_x = win.innerWidth();
			var body_3rd_y = win.innerHeight();

			if (body_2nd_x != body_3rd_x || body_2nd_y != body_3rd_y)
			// if (body_2nd_x < body_3rd_x || body_2nd_y < body_3rd_y)
			{

				// check if we should force the horizontal scrollbar
				if (firefox_overflow || body_2nd_y != body_3rd_y)
				{
					// store previous scollbar setting
					overflow_x = body.css('overflow-x');
					// reset to scroll if not hidden
					if (overflow_x != 'hidden')
					{ body.css('overflow-x', 'scroll'); }
				}

				// check if we should force the vertical scrollbar
				if (firefox_overflow || body_2nd_x != body_3rd_x)
				{
					// store previous scollbar setting
					overflow_y = body.css('overflow-y');
					// reset to scroll if not hidden
					if (overflow_y != 'hidden')
					{ body.css('overflow-y', 'scroll'); }
				}

				// reflow layout
				layout(data);

			}
			// EO if 2nd changed

		}
		// EO if 1st changed

	};
	// EO Manager


	// static global function
	// schedule a layout call in delay ms
	// normally we keep the current waiting timeout
	// set reset if you want to reschedule the repaint
	Manager.schedule = function (delay, reset)
	{

		// do not re-schedule, execute the first timeout.
		// we want it to be called from time to time
		if (!reset && scheduled) return;

		// we should reset the scheduled callback
		// this will enforce the delay to stay
		if (scheduled) clearDefered(scheduled);

		// schedule a layout execution
		scheduled = callDefered(function()
		{

			// call layout
			Manager();

			// reset timer status
			// we are ready for more
			scheduled = null;

		}, delay || 0);

	}
	// EO Manager.schedule


	// static global function
	// add a widget under our control
	Manager.add = function (widget)
	{

		// assign the body object only once
		if (!body) body = jQuery('BODY:first');

		// jQueryfy input argument
		widget = jQuery(widget);

		// attach resize event to call resizer
		if (widgets.length == 0 && widget.length > 0)
		{ jQuery(window).bind('resize', resizer); }

		// push instances to static array
		widgets = widgets.add(jQuery(widget))

		// make static array a global
		// Manager.widgets = widgets;

	};
	// EO Manager.add


	// static global function
	// add a widget under our control
	Manager.del = function (widget)
	{

		// jQueryfy input argument
		widget = jQuery(widget);

		// remove instances from static array
		widgets = widgets.not(widget)

		// remove the resize handler when there are no widgets left
		if (widgets.length == 0) jQuery(window).bind('resize', resizer);

		// make static array a global
		// Manager.widgets = widgets;

	};
	// EO Manager.del


	// make static array a global
	// Manager.widgets = widgets;


	// Maybe we should defer the resize event.
	// This is needed to avoid a possible endless
	// loop in internet explorer 8. This Browser
	// can trigger resize events after scrollbars
	// appear/disapear or on reflow of some element.
	// IE 7 and below always show a scrollbar, so this
	// problem does not seem to exist, otherwise we
	// should also set those browsers to defer the resize.

	// only enqueue one
	var resizing = false;

	// @@@ function: deferer @@@
	var deferer = function ()
	{

		// only register one callback
		if (resizing) return false;

		// register a callback for next idle loop
		resizing = callDefered(function()
		{

			// call layouter
			Manager();

			// reset the lock
			resizing = false;

		}, 0)

	}
	// @@@ EO function: deferer @@@


	// Set resizer to the desired function to execute.
	// Set this on initialization as the decision is always
	// based on information that must not change during runtime.
	// Will be bound to resize event when first widget is added.
	var resizer = resize_defer ? deferer : Manager;


	// make sure our global namespace exists
	// but do not reset it if already present
	if (typeof OCBNET == 'undefined') OCBNET = {};

	// assign class to global namespace
	OCBNET.Layout = Manager;


})(jQuery);
// EO private scope


/*

  Copyright (c) Marcel Greter 2010 - rtp.ch - RTP Multi Event Dispatcher v0.8.2
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Example:

  var xml_doc, xsl_doc;

  var mevent = new RTP.Multievent(function() {

  	// do something with xml_doc and xsl_doc

  })

  // mevent is satisfied when all have been called
  var xml_complete = mevent.prerequisite();
  var xsl_complete = mevent.prerequisite();

  // load url and call mevent prerequisites / store doc when completed
  _ajax.load(xml_url, function (doc) { xml_doc = doc; xml_complete(); });
  _ajax.load(xsl_url, function (doc) { xsl_doc = doc; xsl_complete(); });

*/

if (!window.RTP) window.RTP = {}; // ns

/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */

// constructor (variables/settings and init)
RTP.Multievent = function (cb)
{
	this.cb = cb; // callback when satisifed
	this.ids = 0; // registered prerequisites
	this.args = {}; // save callback arguments
	this.required = 0; // registered prerequisites
	this.listeners = []; // some additional listeners
	this.satisfied = []; // satisfied prerequisites
};

/* @@@@@@@@@@ RTP CLASS @@@@@@@@@@ */

// extend class prototype
(function ()
{

	// get function checker
	var isFn = jQuery.isFunction;

	// @@@ request a new prerequisite that must be satisfied @@@
	this.prerequisite = function(arg)
	{

		var cb = isFn(arg) ? arg : null;
		var name = isFn(arg) ? null : arg;

		var self = this;
		this.required ++;
		var id = this.ids ++;
		this.satisfied[id] = false;

		// return function to be called to signal satisfaction
		return function ()
		{
			if (!self.satisfied[id])
			{
				if (cb) cb();
				self.required --;
				self.satisfied[id] = true;
				if (name) self.args[name] = arguments;
				if (self.required == 0 && self.cb)
				{
					self._cb = self.cb;
					self.cb = false;
					for(var i = 0; i < self.listeners.length; i++)
					{ self.listeners[i]() }
					return self._cb();
				}
			}
		}
	};

	// @@@ finish this multievent @@@
	this.finish = function()
	{

		/* call this method when you add prerequisites dynamically */
		/* this will fire the callback immediately if no prerequisites */
		/* were registered, otherwise we will wait till they are satisfied */

		// execute the callback on no prerequisites
		if (this.ids == 0 && this.cb)
		{
			this._cb = this.cb;
			this.cb = false;
			for(var i = 0; i < this.listeners.length; i++)
			{ this.listeners[i]() }
			return this._cb();
		}

	};

// EO extend class prototype
}).call(RTP.Multievent.prototype);

/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// START anonymous scope
(function(jQuery)
{

	// declare our namespace
	if (!window.RTP) window.RTP = {};

	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */
	RTP.Slider = function (el, conf)
	{

		// create closure for
		// resize event handler
		var slider = this;

		// only init once
		if (slider.inited) { return; }
		else { slider.inited = true; }

		// mix defaults with given settings
		slider.conf = jQuery.extend(
		{

			// the panel alignment to the position
			align: 'center',
			// inherit from align
			alignPanel: false,
			alignViewport: false,

			// vertical sliding is also supported
			vertical: false,

			// set float parameter for panels
			// will not be set if vertical is true
			setFloat: true,

			// enable endless carousel
			carousel: false,

			// the first slide to load after init
			// this can also be a callback function
			slideFirst: 0,

			// how many panels should be visible
			// mainly used for the layout sizers, but
			// also defines how many panels are cloned
			panelsVisible: 1,

			// initialize some structures
			// they can be used by plugins
			text: {}, // localized texts
			tmpl: {} // templates fragments

		}, conf);

		// classes to mark panels
		slider.klass =
		{
			next: 'next',
			current: 'current',
			previous: 'previous'
		};

		// templating bits might be overridden
		slider.tmpl =
		{
			'wrapper' : '<div class="rtp-slider-wrapper"></div>',
			'container' : '<div class="rtp-slider-container"></div>'
		};

		// selectors for dom elements
		slider.selector =
		{
			panel : 'DIV.rtp-slider-panel',
			container : 'DIV.rtp-slider-container'
		};


		// execute all init hooks
		slider.trigger('config');

		if (isNaN(slider.conf.align))
		{ slider.conf.align = 0.5; }
		if (isNaN(slider.conf.panelsVisible))
		{ slider.conf.panelsVisible = 0.5; }

		// current element is used as our viewport
		var viewport = slider.viewport = jQuery(el);

		// get all intial panels (slides) once at startup (after config)
		var slides = slider.slides = viewport.find(slider.selector.panel);

		// put a wrapper around everything
		var wrapper = slider.wrapper = viewport
			.wrapAll(slider.tmpl.wrapper).parent();

		// wrap all panels into container
		var container = slider.container = viewport
			.wrapInner(slider.tmpl.container)
				.find(slider.selector.container);

		// min index for slides and panels
		slider.rmin = slider.smin = slider.pmin = 0;

		if (this.conf.vertical)
		{
			this.wrapper.addClass('rtp-slider-vertical');
		}

		// first slide to load may be a function
		this.position = jQuery.isFunction(slider.conf.slideFirst)
			? slider.conf.slideFirst.call(slider)
			: slider.conf.slideFirst || 0;

		// init array always
		// avoid checks in code
		slider.cloned = jQuery();

		// create cloned panels
		if (slider.conf.carousel)
		{

			// Clone as many panels needed to fill the viewport.
			// If sizer is false you can use this config option
			// to adjust how many panels you want to have cloned
			// In this mode the viewport might be much wider than
			// all panels inside. Todo: Maybe support this better.
			var panelsToClone = this.conf.clonePanels ||
			                    Math.ceil(this.conf.panelsVisible);

			// accumulate all cloned panels
			// we may clone each slide more than once
			var cloned = jQuery();

			// I will clone as many as you wish
			while (panelsToClone > slides.length)
			{
				// remove a full set of slides
				panelsToClone -= slides.length;
				// clone and add another full set
				cloned = cloned.add(slides.clone());
			}

			// clone panels from begining to extend the container
			cloned = cloned.add(slides.slice(0, panelsToClone).clone());

			// append the cloned panels to the container and set class
			cloned.appendTo(slider.container).addClass('cloned');

			// increase maximum slide index
			slider.smax += cloned.length;

			// store the cloned panels
			slider.cloned = cloned;

		}
		// EO if conf.carousel

		// @@@ private fn: resolve_align @@@
		// this can be a number between -INF and +INF
		// or you can use "left", "center" or "right"
		function resolve_align (key, preset)
		{

			// get configured option
			var align = this.conf[key];

			// check if align matches any of our strings
			if (new RegExp(/^l/i).test(align)) align = 0.0;
			if (new RegExp(/^c/i).test(align)) align = 0.5;
			if (new RegExp(/^r/i).test(align)) align = 1.0;

			// now check if it's valid or use given preset
			if (isNaN(parseInt(align, 10))) align = preset;
			// maybe there was no preset given, check again
			if (isNaN(parseInt(align, 10))) align = 0.5;

			// assign and return the number
			return this.conf[key] = align;

		}
		// EO @@@ private fn: resolve_align @@@

		// first resolve the shared value to inherit from
		var preset = resolve_align.call(this, 'align', 0.5);
		// then resolve the specific align options
		resolve_align.call(this, 'alignViewport', preset);
		resolve_align.call(this, 'alignPanel', preset);


		// execute all init hooks
		slider.trigger('init');


		// lookup panels - equals slides if carousel == false
		slider.panels = viewport.find(slider.selector.panel);

		// to which side should we float the panels / container
		var floating = this.conf.offsetReverse ? 'right' : 'left';

		if (this.conf.vertical) floating = 'none';

		var overflow = this.conf.carousel3d ? 'visible' : 'hidden';

		// set some css to fix some issues
		// if you do not want this you have
		// to remove these styles on ready event
		this.panels
			.css({
				'float' : floating
			})
			.add(this.viewport)
			.add(this.container)
			.css({
				'zoom' : 1,
				'overflow' : overflow,
				'position' : 'relative'
			});
if (this.conf.vertical)
{
		this.viewport.css({
			'min-height': '50px'
		});
		this.container.css({
			'top': '0px',
			'left': '0px',
			'right': '0px',
			'bottom': '0px',
			'position': 'absolute'
		});

}


		// setup floats for the container
		if (!this.conf.vertical)
		{
			// we either float the container right or left
			this.container.css('float', floating)
				// insert a float clearing div after the container
				.after('<DIV style="clear:both;"/>');
		}

		// private named function
		// execute when images loaded
		function loaded ()
		{

			// trigger ready hook
			slider.trigger('ready');

		};
		// EO fn loaded

		// defer until all images are loaded
		// otherwise we will not get valid info
		// about resource dimensions like images
        var loadingImages = $('IMG', viewport).imagesLoaded();
        loadingImages.done(loaded);

	};
	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */


	/* @@@@@@@@@@ RTP CLASS @@@@@@@@@@ */
	(function (prototype, jQuery)
	{

		// @@@ method: panel2panel @@@
		prototype.panel2panel = function(panel)
		{
			// adjust for carousel
			if (this.conf.carousel)
			{
				// adjust panels into the valid range
				while (panel > this.smax) panel -= this.slides.length;
				while (panel < this.smin) panel += this.slides.length;
			}
			else
			{
				// adjust panels to outer ranges
				if (panel > this.smax) panel = this.smax;
				if (panel < this.smin) panel = this.smin;
			}
			// return the in range panel
			return panel;
		}
		// @@@ EO method: panel2panel @@@


		// @@@ method: slide2panel @@@
		prototype.slide2panel = function(slide)
		{
			return this.panel2panel(slide + this.smin);
		}
		// @@@ EO method: slide2panel @@@


		// @@@ method: panel2slide @@@
		prototype.panel2slide = function (panel)
		{
			return this.panel2panel(panel) - this.smin;
		}
		// @@@ EO method: panel2slide @@@


		// @@@ method: panel2slide @@@
		prototype.slide2slide = function (slide)
		{
			return this.panel2slide(this.slide2panel(slide));
		}
		// @@@ EO method: panel2slide @@@


	// EO extend class prototype
	})(RTP.Slider.prototype, jQuery);
	/* @@@@@@@@@@ RTP CLASS @@@@@@@@@@ */


	/* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */
	jQuery.fn.rtpSlider = function(conf)
	{
		return this.each(function(){
			// check if already initialized
			if (typeof jQuery(this).data('rtp-slider') == 'undefined')
			{ jQuery(this).data('rtp-slider', new RTP.Slider(this, conf)); }
			// else { rtp.log('tried to init slider twice') }
		});
	}
	/* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */


// END anonymous scope
})(jQuery);

/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Hook Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// create the hooks hash on prototype
	// this is shared across all instances
	prototype.hooks = {};


	// @@@ method: trigger @@@
	// execute both custom and static
	// hooks for this slider instance
	prototype.trigger = function()
	{

		// get a copy of all arguments and shift off type
		var args = [].slice.call(arguments), type = args.shift();

		// first call our method by that name if it seems to be a function
		if (this[type] && this[type].apply) this[type].apply(this, args);

		// declare an array with all hooks in order
		var hooks = [this.hooks, this.conf.hooks];

		// process each hooks array (object/config)
		for (var i = 0; i < hooks.length; i++)
		{

			// check if hook type is available
			if (hooks[i] && hooks[i][type])
			{

				// get into local variable
				var hook = hooks[i][type];

				// process single hooks function
				if (jQuery.isFunction(hook))
				{ return hook.apply(this, args); }

				// process all hooks in the array
				for(var n = 0; n < hook.length; n++)
				{ hook[n].apply(this, args); }

			}
		}

	}
	// @@@ EO method: trigger @@@


	// @@@ private fn: ordersort @@@
	function ordersort(a, b)
	{
		return a.order - b.order;
	}
	// @@@ EO private fn: ordersort @@@


	// @@@ private fn: addHook @@@
	function addHook (hooks, type, cb, order)
	{

		// default order for callback
		if (isNaN(cb.order)) cb.order = 0;

		// check if given order is valid
		if (!isNaN(order)) cb.order = order;

		// make sure the hook type is available
		// we allow any type of hook to be registered
		if (!hooks[type]) hooks[type] = [];

		// register plugin callback
		hooks[type].push(cb);

		// now sort the hooks by their orders
		hooks[type] = hooks[type].sort(ordersort)

	}
	// @@@ EO private fn: addHook @@@


	// @@@ method: plugin @@@
	// insert callback into static hooks
	// these callbacks are shared accross all instances
	// we only allow this fuction to be called statically
	// for this we check if the conf object is not defined yet
	// example: RTP.Slider.plugin('type', function() {});
	prototype.plugin = function(type, cb, order)
	{

		// declare local variable
		var hooks = this.hooks;

		// if this happens you propably wanted to
		// register a custom and not a static hook
		if (typeof this.conf != 'undefined')
		{

			// throw an error message to the console
			// this is a coding error an not a config error
			throw('plugin can only be called on object prototype');

		}

		// add through addHook
		addHook (hooks, type, cb, order);

	}
	// @@@ EO method: plugin @@@


	// @@@ method: listen @@@
	// insert callback into our hooks (on config)
	// these callbacks are local to a slider instance
	prototype.listen = function (type, cb, order)
	{

		// declare local variable
		var ready = this.isReady,
		    hooks = this.conf.hooks;

		// if this happens you propably wanted to
		// register a static and not a custom hook
		if (typeof this.conf == 'undefined')
		{

			// throw an error message to the console
			// this is a coding error an not a config error
			throw('listen can only be called on real instance');

		}

		// check some status variables to dispatch to late event bindings
		if (ready !== null && type == 'init') return cb.call(this);
		if (ready === true && type == 'ready') return cb.call(this);

		// add through addHook
		addHook (hooks, type, cb, order);

	}
	// @@@ EO method: listen @@@


	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// init ready state
		this.isReady = null;

		// create defered object
		// remember timeout ids
		this.defered = {};

		// create hook object
		if (!this.conf.hooks)
		{ this.conf.hooks = {}; }

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// prepare ready state
		this.isReady = null;

	});
	// @@@ EO plugin: init @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// now set ready state
		this.isReady = true;

		// call start hook defered
		this.trigger('start');

	}, 9999);
	// @@@ EO plugin: ready @@@


	// @@@ method: defer @@@
	// execute both custom and static
	// hooks for this slider instance
	prototype.defer = function()
	{

		// create closure
		var self = this;

		// get a copy of all arguments and get the type
		var args = [].slice.call(arguments),
		    // get the type from first argument
		    // both options may be overwritten below
		    type = args[0], delay = 0;


		// implement option to pass delay
		// you have to pass it as the first argument
		if (!isNaN(args[0]))
		{

			// shift away delay from arguments
			// get type from now first argument
			delay = args.shift(); type = args[0];

		}
		// EO if delay is given

		// this type is already registered
		// to be called on next idle loop
		if (this.defered[type]) return;

		// create callback function
		var fn = function()
		{
			// reset first so we can register
			// this type again to be called
			self.defered[type] = false;
			// now trigger the event type
			self.trigger.apply(self, args)
		}

		// create the defered call via timeout with zero delay
		this.defered[type] = window.setTimeout(fn, delay);

	}
	// @@@ EO method: defer @@@


	// @@@ method: undefer @@@
	// reset waiting defered event
	prototype.undefer = function(type)
	{

		// clear the registered timeout
		window.clearTimeout(this.defered[type]);

		// reset so we can register again
		this.defered[type] = false;

	}
	// @@@ EO method: undefer @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Slides Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ method: setSlideDim @@@
	// set the given slide index to given size
	// this method is not available to panels as
	// we have to make sure that cloned panels have
	// exactly the same size as the original panel
	// set the outer dimension of the slide panel
	prototype.setSlideDim = function (slide, outerdim)
	{

		// declare loop variables
		var outer = this.pd[0],
		    inner = this.ps[0],
		    layout = this.pl[0],
		    border = this.pb[0],
		    margin = this.pm[0],
		    padding = this.pp[0];

		// normalize the input variable
		slide = this.slide2slide(slide);

		// get array with all panels for slide
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

			// update dimension and inner size of this panel
			this.pd[0][p] = outerdim;

			this.ps[0][p] = outerdim - boxdiff;

			var dim = this.ps[0][p];

			// if (layout[i] == 'content-box')
			// { dim += padding[i][2]; }
			// else if (layout[i] == 'border-box')
			// { dim += padding[i][2] + border[i][2]; }

			// update panel size
			if (this.conf.vertical)
			{ jQuery(panel).height(dim); }
			else { jQuery(panel).width(dim); }

			// update the panel opposition
			this.pd[1][p] = this.getPanelSize(p, 1);

		}
		// EO each panel

	}
	// @@@ EO method: setSlideDim @@@


	// @@@ method: getPanelsBySlide @@@
	// slidepanel does only store indexes
	// return the actual panel jquery nodes
	prototype.getPanelsBySlide = function (slide)
	{

		// parse into integer
		slide = parseInt(slide, 10);

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
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Panels Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: config @@@
	// attach and create status arrays
	// store all panels style definitions
	prototype.plugin('config', function ()
	{

		// sizes
		this.ps = [[], []];
		// margins
		this.pm = [[], []];
		// borders
		this.pb = [[], []];
		// paddings
		this.pp = [[], []];
		// dimensions
		this.pd = [[], []];

		// layout
		this.pl = [];

	})
	// @@@ EO plugin: config @@@



	// @@@ private fn: getBoxSizeCssStr @@@
	function getBoxSizeCssStr (invert)
	{

		// get the reverse option from config
		var reverse = this.conf.offsetReverse;

		// return the strings according to options
		return this.conf.vertical ^ invert
			? (reverse ? ['Bottom', 'Top'] : ['Top', 'Bottom'])
			: (reverse ? ['Right', 'Left'] : ['Left', 'Right']);

	}
	// @@@ EO private fn: getBoxSizeCssStr @@@


	// @@@ privat fn: getPanelBoxCss @@@
	function getPanelBoxCss (panel, prefix, suffix, invert)
	{

		// get the box size strings (ie left/right)
		var css = getBoxSizeCssStr.call(this, invert);

		// get the left and right value for this css box object
		var left = parseFloat(panel.css(prefix + css[0] + suffix), 10);
		var right = parseFloat(panel.css(prefix + css[1] + suffix), 10);

		// some browser may return auto when the actual value is zero (ie8)
		if(isNaN(left)) left = 0; if(isNaN(right)) right = 0;

		// return an array with values and sum
		return [left, right, left + right];

	}
	// @@@ EO privat fn: getPanelBoxCss @@@


	// @@@ privat fn: getPanelMargin @@@
	function getPanelMargin (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'margin', '', invert);

	}
	// @@@ EO privat fn: getPanelMargin @@@


	// @@@ privat fn: getPanelBorder @@@
	function getPanelBorder (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'border', 'Width', invert);

	}
	// @@@ EO privat fn: getPanelBorder @@@


	// @@@ privat fn: getPanelPadding @@@
	function getPanelPadding (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'padding', '', invert);

	}
	// @@@ EO privat fn: getPanelPadding @@@


	// @@@ method: getPanelSize @@@
	prototype.getPanelSize = function (panel, invert)
	{

		// access panel only once (get id into range)
		panel = this.panels.eq(this.panel2panel(panel));

		// return the panel axis size
		return this.conf.vertical ^ invert
			? panel.height() : panel.width();

	}
	// @@@ EO method: getPanelSize @@@


	// @@@ method: updatePanels @@@
	// create slidepanels lookup array
	// trigger updatedPanels hook
	prototype.updatePanels = function ()
	{

		// initialize slidepanels
		this.slidepanels = [];

		// get slides length
		this.slen = this.slides.length;

		// max index for real slider panels (not cloned ones)
		this.smax = this.smin + this.slen - 1;

		// test how much viewable each panel is right now
		for(var i = 0; i < this.panels.length; i ++)
		{

			// normalize from panel to slide
			var slide = this.panel2slide(i);

			// generate slidepanels array
			if (!this.slidepanels[slide])
			{ this.slidepanels[slide] = [i]; }
			else { this.slidepanels[slide].push(i); }

		}
		// EO foreach panel

		// trigger updatedPanels hook
		// hook is not yet used by anyone
		// this.trigger('updatedPanels');

	}
	// @@@ EO method: updatePanels @@@


	// @@@ private fn: readPanelsSize @@@
	function readPanelsSize (invert)
	{

		// declare loop variables
		var size,
		    outer = this.pd[invert],
		    inner = this.ps[invert],
		    layout = this.pl[invert],
		    border = this.pb[invert],
		    margin = this.pm[invert],
		    padding = this.pp[invert];

		// reset size and dim array
		inner.length = outer.length = 0;

		// collect size and margin for all panels
		var i = this.panels.length; while (i--)
		{

			// get actual panel size on drag axis
			inner[i] = size = this.getPanelSize(i, invert);

			// add padding, border and margin to size for final dimension
			outer[i] = size + padding[i][2] + border[i][2] + margin[i][2];

			// adjust for panel box sizing
			// this may not work with all jquery versions
			// once jquery starts to fully support this itself
			// if (layout[i] == 'padding-box')
			// { inner[i] += padding[i][2]; }
			// else if (layout[i] == 'border-box')
			// { inner[i] += padding[i][2] + border[i][2]; }

		}
		// EO foreach panel

	}
	// @@@ EO private fn: readPanelsSize @@@


	// @@@ private fn: readPanelsStyles @@@
	function readPanelsStyles (invert)
	{

		// store box-sizing
		this.pl[invert] = [];

		// store margin
		this.pm[invert] = [];
		// store border
		this.pb[invert] = [];
		// store padding
		this.pp[invert] = [];

		// collect size and margin for all panels
		var i = this.panels.length; while (i--)
		{

			// access panel only once (get id into range)
			var panel = this.panels.eq(this.panel2panel(i));

			// get box sizing to adjust some stuff later
			this.pl[invert][i] = panel.css('box-sizing');

			// get panel margin for both sides (and a sum of them)
			this.pm[invert][i] = getPanelMargin.call(this, panel, invert);
			this.pb[invert][i] = getPanelBorder.call(this, panel, invert);
			this.pp[invert][i] = getPanelPadding.call(this, panel, invert);

		}
		// EO foreach panel

	}
	// @@@ EO private fn: readPanelsStyles @@@

	// @@@ method: checkPanelStyles @@@
	// get the panel styles from UA
	// store values to use them later
	// trigger changedPanelsDim hook
	// trigger changedPanelsOpp hook
	prototype.checkPanelsStyle = function(flag)
	{

		// read styles for both axes
		readPanelsStyles.call(this, 0);
		readPanelsStyles.call(this, 1);

		// read some more styles
		readPanelsSize.call(this, 0);
		readPanelsSize.call(this, 1);

		// calculate offsets
		this.updatePanelsOffset();

	}
	// @@@ EO checkPanelStyles @@@


	// @@@ method: readPanelsDim @@@
	prototype.readPanelsDim = function()
	{

		// get sizes for drag axis
		readPanelsSize.call(this, 0);

	};
	// @@@ EO method: readPanelsDim @@@

	// @@@ method: readPanelsDim @@@
	prototype.readPanelsOpp = function()
	{

		// get sizes for scroll axis
		readPanelsSize.call(this, 1);

	};
	// @@@ EO method: readPanelsOpp @@@


	// @@@ method: checkPanelStyles @@@
	// update offset array from stored dimensions
	prototype.updatePanelsOffset = function()
	{

		if (this.conf.carousel3d)
		{

			// get local variable
			var dimensions = this.pd[0];

			// calculate offset for each panel
			var offset = 0; this.offset = [0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				// sum up and store current offset
				this.offset.push(offset += dimensions[i]);

			}
			// EO foreach panel

			// trigger hook to adjust container
			this.trigger('changedPanelsOffset');

		}
		// hardcore calculation by getting the real offsets
		// this will lead to perfect offset positions
		else
		{

			// trigger hook to adjust container
			this.trigger('changedPanelsOffset');

			// get local variable
			var dimensions = this.pd[0];

			// calculate offset for each panel
			var offset = 0; this.offset = [];

	// this.panels.css('float', 'left');

				var offset = this.panels.eq(0).offset();

				var start = this.conf.vertical ? offset.top : offset.left;
	start -= this.pm[0][0][0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				offset = this.panels.eq(i).offset();

				offset = this.conf.vertical ? offset.top : offset.left;

				offset = parseFloat(offset) - start - this.pm[0][i][0];

				// sum up and store current offset
				this.offset.push(offset);

			}
			// EO foreach panel

			if (this.panels.length)
			{
				this.offset.push(parseFloat(offset) + this.pd[0][i-1])
			}

		}

	};
	// @@@ EO checkPanelStyles @@@



	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// calculate base values
		this.updatePanels();

		// read panel sizes and margins
		this.checkPanelsStyle();

	}, - 99);
	// @@@ EO plugin: ready @@@



// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Viewport Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// extend default configuration
		this.conf = jQuery.extend
		(
			{

				// link wrapper dimension to viewport
				linkWrapperToViewportDim: true,
				// link wrapper opposition to viewport
				linkWrapperToViewportOpp: false

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// @@@ method: getViewportOffset @@@
	prototype.getViewportOffset = function ()
	{

		// get the viewport offset
		var offset = this.viewport.offset();

		// normalize drag and scroll axis
		return this.conf.vertical
			? { x : offset.top, y : offset.left }
			: { x : offset.left, y : offset.top };

	}
	// @@@ EO method: getViewportOffset @@@


	// @@@ private fn: setViewportSize @@@
	// this may not work as other css might overrule us
	// the implementer has to make sure this does not happen
	function setViewportSize (value, invert)
	{

		// value -= 1;

		// get local variable
		var conf = this.conf,
		    wrapper = this.wrapper,
		    viewport = this.viewport;

		// set the height
		if (conf.vertical ^ invert)
		{
			viewport.height(value);
			if (conf.linkWrapperToViewportOpp)
			{ wrapper.height(viewport.outerHeight(true)); }
		}
		// set the width
		else
		{
			viewport.width(value);
			if (conf.linkWrapperToViewportDim)
			{ wrapper.width(viewport.outerWidth(true)); }
		}

	}
	// @@@ EO private fn: setViewportSize @@@


	// @@@ method: setViewportDim @@@
	prototype.setViewportDim = function (value)
	{

		// does the value really change
		// if (this.vp_x == value) return;

		// assign given viewport dimension
		setViewportSize.call(this, value, 0);

		this.vp_x = value;

		// now trigger the changedViewportOpp hook
		this.trigger('updatedViewportDim', value);

	}
	// @@@ EO method: setViewportDim @@@

	// @@@ method: setViewportOpp @@@
	prototype.setViewportOpp = function (value)
	{

		// does the value really change
		// if (this.vp_y == value) return;

		// assign given viewport opposition
		setViewportSize.call(this, value, 1);

		// now trigger the changedViewportOpp hook
		this.trigger('updatedViewportOpp', value);

	}
	// @@@ EO method: setViewportOpp @@@


	// @@@ private fn: getViewportSize @@@
	function getViewportSize (invert)
	{

		// get local variable
		var viewport = this.viewport;

		// return the viewport axis size
		return this.conf.vertical ^ invert
			? viewport.height() : viewport.width();

	}
	// @@@ EO private fn: getViewportSize @@@


	// @@@ method: getViewportDim @@@
	prototype.getViewportDim = function ()
	{

		// return current viewport dimension
		return getViewportSize.call(this, 0);

	}
	// @@@ EO method: getViewportDim @@@

	// @@@ method: getViewportOpp @@@
	prototype.getViewportOpp = function ()
	{

		// return current viewport opposition
		return getViewportSize.call(this, 1);

	}
	// @@@ EO method: getViewportOpp @@@


	// @@@ method: readviewportDim @@@
	prototype.readviewportDim = function()
	{

		// store the current viewport dimension
		this.vp_x = getViewportSize.call(this, 0);

	}
	// @@@ EO method: readviewportDim @@@

	// @@@ method: readviewportOpp @@@
	prototype.readviewportOpp = function()
	{

		// store the current viewport opposition
		this.vp_y = getViewportSize.call(this, 1);

	}
	// @@@ EO method: readviewportOpp @@@


	// @@@ method: checkViewportDim @@@
	// get viewport dimension from UA
	// if viewport dimension has changed
	// trigger the changedViewportDim hook
	prototype.checkViewportDim = function()
	{

		// get the current viewport dimension
		var current = getViewportSize.call(this, 0);

		// check if dimension change
		if (this.vp_x !== current)
		{

			// store previous value and assign new value
			var previous = this.vp_x; this.vp_x = current;

			// now trigger the changedViewportDim hook
			this.trigger('changedViewportDim', current, previous);

		}
		// EO if value changed

	}
	// @@@ EO method: checkViewportDim @@@



	// @@@ method: checkViewportOpp @@@
	// get viewport opposition from UA
	// if viewport opposition has changed
	// trigger the changedViewportOpp hook
	prototype.checkViewportOpp = function()
	{

		// get the current viewport opposition
		var current = getViewportSize.call(this, 1);

		// check if opposition change
		if (this.vp_y !== current)
		{

			// store previous value and assign new value
			var previous = this.vp_y; this.vp_y = current;

			// now trigger the changedViewportOpp hook
			this.trigger('changedViewportOpp', current, previous);

		}
		// EO if value changed

	}
	// @@@ EO method: checkViewportOpp @@@

/*
	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// check viewport sizes
		this.checkViewportDim();
		this.checkViewportOpp();

	});
	// @@@ EO plugin: ready @@@
*/

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Container Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ private fn: getSizeCssStr @@@
	function getSizeCssStr (invert)
	{

		return this.conf.vertical ^ invert
			? 'height' : 'width';

	}
	// @@@ EO private fn: getSizeCssStr @@@


	// @@@ private fn: getOffsetCssStr @@@
	function getOffsetCssStr (invert)
	{

		// get the reverse option from config
		var reverse = this.conf.offsetReverse;

		// return the string according to options
		return this.conf.vertical ^ invert
			? (reverse ? 'marginBottom' : 'marginTop')
			: (reverse ? 'marginRight' : 'marginLeft');

	}
	// @@@ EO private fn: getOffsetCssStr @@@


	// @@@ method: getContainerOffset @@@
	prototype.getContainerOffset = function(invert)
	{

		// return a float number from the container offset
		return - (parseFloat(this.container.css(getOffsetCssStr.call(this, invert)), 10) || 0)

	}
	// @@@ EO method: getContainerOffset @@@


	// @@@ method: setContainerOffset @@@
	prototype.setContainerOffset = function(offset, invert)
	{

		// get the left and right position
		// also calculate size of all slides
		var left = this.offset[this.smin],
		    right = this.offset[this.smax + 1],
		    size = right - left;

		// adjust for carousel
		if (this.conf.carousel)
		{
			// shift into prefered and best visible area
			// this may go wrong if floated to the right?
			while (offset < left) { offset += size; }
			while (right <= offset) { offset -= size; }
		}
		// EO if conf.carousel

		// allow offsets outside the valid range
		// if (offset < left) { offset = left; }
		// if (right < offset) { offset = right; }

		// set the offset position of the container to the viewport
		this.container.css(getOffsetCssStr.call(this, invert), - offset);

		// update internal variable
		// needed to calc visibilities
		this.ct_off = offset;

	}
	// @@@ EO method: setContainerOffset @@@


	// @@@ method: readContainerOffset @@@
	prototype.readContainerOffset = function ()
	{

		// update the container offset
		this.ct_off = this.getContainerOffset(0);

	};
	// @@@ EO method: readContainerOffset @@@


	// @@@ method: checkContainerOffset @@@
	// get container offset from browser
	// check if offset value has changed
	// trigger changedContainerOffset hook
	prototype.checkContainerOffset = function()
	{

		// get the current container offset
		var current = this.getContainerOffset(0);

		// check if dimension change
		if (this.ct_off !== current)
		{

			// store previous value and assign new value
			var previous = this.ct_off; this.ct_off = current;

			// now trigger the changedContainerOffset hook
			this.trigger('changedContainerOffset', current, previous);

		}
		// EO if value changed

	}
	// @@@ EO method: checkContainerOffset @@@


	// @@@ plugin: changedPanelsOffset @@@
	prototype.plugin('changedPanelsOffset', function ()
	{

		if (this.conf.vertical) return;

		var dim = 0, i = this.panels.length; while (i--)
		{ dim += this.pd[0][i] }

		// set the container width/height to the calculated value to contain all panels
		// there is no getter or setter method for this particular container attribute
		// we really only need to adjust this dimension if the panel dimensions have changed
		this.container.css(getSizeCssStr.call(this), dim + 'px')

	}, - 9999);
	// @@@ EO plugin: changedPanelsOffset @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// check container offset
		// trigger changedPanelsOffset
		this.checkContainerOffset();

	}, - 99);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Visibility Core Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ method: updatePanelExposure @@@
	prototype.updatePanelExposure = function ()
	{

		// get values from the current internal status
		var position = this.slide2panel(this.position),
		    visible = this.conf.panelsVisible || 1;

		// declare local variables
		var conf = this.conf,
		    alignPanel = conf.alignPanel,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanel,
				    fill_right = -1 * fill_left + panelsVisible - 1;

				// adjust panel position to make those
				// panels "virtually" visible / exposed
				if (position < this.smin + fill_left)
				{ position = this.smin + fill_left; }
				if (position > this.smax - fill_right)
				{ position = this.smax - fill_right; }

			}
			// EO if conf.fillViewport

			// shrink the viewport on both ends
			else if (conf.shrinkViewport)
			{

				// make sure we only show one slide at the end
				if (position > this.smax + 1 - this.smin - panelsVisible)
				{ panelsVisible = this.smax + 1 - position; }
				// make sure we only show one slide at the start
				else if (position < this.smin - 1 + panelsVisible)
				{ panelsVisible = this.smin + 1 + position; }

			}
			// EO if conf.shrinkViewport

		}
		// EO if not conf.carousel

		// adjust the panel position for the viewport and panel alignment
		position += alignPanel - alignViewport * panelsVisible;

		// declare local variables
		var exposure = [],
		    left = position,
		    i_left = Math.floor(left),
		    right = position + panelsVisible,
		    i_right = Math.ceil(right);

		// initialize exposure array
		var i = this.slides.length;
		while (i--) { exposure[i] = 0; }

		// process panels in visible range
		for (i = i_left; i < i_right; i++)
		{

			// declare local variables
			var out_left = left - i,
			    in_right = right - i,
			    slide = this.slide2slide(i);

			// add visibility
			if (in_right < 1)
			{ exposure[slide] += in_right; }
			else { exposure[slide] += 1; }

			// remove visibility
			if (out_left > 0)
			{ exposure[slide] -= out_left; }

		}

		// store state before calling the changed hock
		// reset the status first, but pass before status
		var s_e = this.s_e; this.s_e = exposure;

		// execute the updatedSlideExposure hook for slides
		this.trigger('updatedSlideExposure', exposure, s_e);


	}
	// @@@ EO method: updatePanelExposure @@@


	// @@@ method: checkSlideVisibility @@@
	prototype.checkSlideVisibility = function ()
	{

		// get values from the current internal status
		var panel = this.ct_off;

		// declare local variables
		var visible,
		    panel_left = 0,
		    visibility = [],
		    widths = this.pd[0],
		    i = this.slides.length,
		    view_left = this.ct_off,
		    view_right = view_left + this.vp_x;

		// initialize visibility array
		while (i--) { visibility[i] = 0; }

		// test how much viewable each panel is right now
		for(i = 0; panel_left < view_right; i ++)
		{

			// normalize from panel to slide
			var slide = this.panel2slide(i);

			// calculate the right panel edge
			var panel_right = panel_left + widths[slide];

			// the panel is out on the left or out on the right
			if (panel_right < view_left || panel_left > view_right)
			{
				visible = 0;
			}
			// the panel is completely inside the viewport
			else if (panel_left >= view_left && panel_right <= view_right)
			{
				visible = 1;
			}
			// the panel does not fit into the viewport completely
			else if (panel_left < view_left && panel_right > view_right)
			{
				visible = (view_right - view_left) / (panel_right - panel_left)
			}
			// the panel is partially on the left
			else if (panel_left < view_left)
			{
				visible = ( panel_right - view_left ) / ( panel_right - panel_left );
			}
			// the panel is partially on the right
			else if (panel_right > view_right)
			{
				visible = ( view_right - panel_left ) / ( panel_right - panel_left );
			}
			// this should not happen
			else
			{
				throw('updateVisibility has invalid state')
			}

			// sum up for slides
			visibility[slide] += visible;

			// move to next panel offset
			panel_left = panel_right;

		}
		// EO each panel

		// store state before calling the changed hock
		// reset the status first, but pass before status
		var s_v = this.s_v; this.s_v = visibility;

		// execute the changedSlideVisibility hook for slides
		this.trigger('changedSlideVisibility', visibility, s_v);

	}
	// @@@ EO method: checkSlideVisibility @@@

	/*
	   The priorities here are important. First we need to call
	   updatePanelExposure to setup viewport dimension (the
	   position has to be set already). Then in the middle we
	   set the container offset, so we then later can call
	   checkSlideVisibility with the updated viewport.
	*/

	// executed when the position is set programmatically (changed internal)
	prototype.plugin('layout', prototype.updatePanelExposure, -99);
	prototype.plugin('layout', prototype.checkSlideVisibility, 99);

	// executed when we have a changed viewport dimension (changed external)
	// prototype.plugin('changedViewportDim', prototype.updatePanelExposure, -99);
	// prototype.plugin('changedViewportDim', prototype.checkSlideVisibility, 99);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Position Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ method: setPosition @@@
	prototype.setPosition = function (position)
	{

		// normalize the slide index
		position = this.slide2slide(position);

		// check if the position really changed
		if (this.position == position) return;

		// get prvious position to pass
		var previous = this.position;

		// store normalized position
		this.position = position;

		// update the layout
		this.trigger('layout', {});

	}
	// @@@ EO method: setPosition @@@


	// @@@ method: setOffsetByPosition @@@
	prototype.setOffsetByPosition = function (position)
	{

		// store current normalized position
		this.position = this.slide2slide(position);

		// declare local variables
		var conf = this.conf,
		    alignPanel = conf.alignPanel,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanel,
				    fill_right = -1 * fill_left + panelsVisible - 1;

				// adjust panel position to make those
				// panels "virtually" visible / exposed
				if (position < this.smin + fill_left)
				{ position = this.smin + fill_left; }
				if (position > this.smax - fill_right)
				{ position = this.smax - fill_right; }

			}
			// EO if conf.fillViewport

			// shrink the viewport on both ends
			// the check here does not seem to be needed
			// enable it anyway and if there is a bug, find
			// out why this check should not be here
			else if (conf.shrinkViewport)
			{

				// make sure we only show one slide at the end
				if (position > this.smax + 1 - this.smin - panelsVisible)
				{ panelsVisible = this.smax + 1 - position; }
				// make sure we only show one slide at the start
				else if (position < this.smin - 1 + panelsVisible)
				{ panelsVisible = this.smin + 1 + position; }

			}
			// EO if conf.shrinkViewport

		}
		// EO if not conf.carousel

		// get the pixel offset for the given relative index
		var px = this.getOffsetByPosition(position);

		// adjust the offset on the viewport
		px -= this.vp_x * alignViewport;

		// adjust the container offset
		this.setContainerOffset(px);

	}
	// @@@ EO method: setOffsetByPosition @@@


	// @@@ method: getOffsetByPosition @@@
	prototype.getOffsetByPosition = function (index)
	{

		// index is meant as slide, get into panels
		index += this.smin + this.conf.alignPanel;

		if (this.conf.carousel)
		{
			// adjust index into the valid panel range
			while (index > this.smax) index -= this.slides.length;
			while (index < this.smin) index += this.slides.length;
		}
		else
		{
			// adjust index into the valid panel range
			if (index <= this.smin + 0) return this.offset[this.smin];
			if (index >= this.smax + 1) return this.offset[this.smax + 1];
		}

		// get the panel on the left side
		var panel = Math.floor(index);

		// get the floating part
		var fpart = index - panel;

		// solve by distributing in the panel
		var px = this.pd[0][panel] * fpart;

		// add the offset of the panels
		px += this.offset[panel];

		// return px
		return px;

	}
	// @@@ EO method: getOffsetByPosition @@@


	// @@@ method: getPositionByOffset @@@
	prototype.getPositionByOffset = function (px)
	{

		// ensure pixel as integer
		px = parseInt(px + 0.5, 10);

		// get the left and right position
		// also calculate size of all slides
		var left = this.offset[this.smin],
		    right = this.offset[this.smax + 1],
		    align = this.conf.alignPanel + this.smin;


		if (this.conf.carousel)
		{
			// shift into prefered and best visible area
			while (px < left) { px += right - left; }
			while (right <= px) { px -= right - left; }
		}
		else
		{
			if (px <= left) { return this.smin; }
			if (px >= right) { return this.smax + 1; }
		}

		// process all panels from left until we find
		// a panel that is currently moving out of view
		var i = this.panels.length; while (i--)
		{

			// assign to local variables
			var panel_left = this.offset[i+0];
			var panel_right = this.offset[i+1];

			// make test for equality first
			// this is the most common case so
			// avoid the unnecessary calculation
			if (panel_left == px) return i - align;

			// test if pixel offset lies in this panel
			if (panel_right > px && px > panel_left)
			{

				// return the calculated position (intoPanel / panelSize + i - offset)
				return (px - panel_left) / (panel_right - panel_left) + i - this.smin - align;

			}
			// EO if position in panel

		}
		// EO each panel

		// this should not ever happen, debug!!
		throw('getPositionByOffset has invalid state');

	}
	// @@@ EO method: getPositionByOffset @@@


	// @@@ plugin: layout @@@
	prototype.plugin('layout', function ()
	{

		// normalized the position before layouting
		this.position = this.slide2slide(this.position);

	}, - 999);
	// @@@ EO plugin: layout @@@


	// @@@ plugin: layout @@@
	prototype.plugin('layout', function ()
	{

		// just reset the current position
		this.setOffsetByPosition(this.position);

	});
	// @@@ EO plugin: layout @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Animation Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// store jquery animation
		this.animating = false;

		// animation queue
		this.queue = [];

		// default configuration
		this.conf = jQuery.extend
		(
			{
				// easing duration per slide
				easeDuration: 1200,
				// easing function per step
				easeFunction: 'easeInOutExpo'
			},
			this.conf
		);

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
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Sizer Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// extend default configuration
		this.conf = jQuery.extend
		(
			{

				// sizer is used to adjust ui elements
				// this is mainly used to switch between
				// panelsByViewport or viewportByPanels mode
				sizer: false

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// @@@ method: preLayout @@@
	// called by OCBNET.Layout library
	prototype.preLayout = function(data)
	{

		// read viewport dimensions first
		// use only these values to adjust ui
		this.trigger('readviewportDim', data);
		this.trigger('readviewportOpp', data);

	}
	// @@@ EO method: preLayout @@@


	// @@@ method: updateLayout @@@
	// called by OCBNET.Layout library
	prototype.updateLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
			data.force
		)
		{

			// update and adjust all ui elements
			// only use the values previously read
			this.trigger('changedViewportDim', data);

		}
		// EO if dimension changed

	}
	// @@@ EO method: updateLayout @@@


	// @@@ method: postLayout @@@
	// called by OCBNET.Layout library
	prototype.postLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
			data.force
		)
		{

			// update the lock variable
			// tells us when layout was run
			this.vp_x_lck = this.vp_x;
			this.vp_y_lck = this.vp_y;

			// redo all layouts
			this.trigger('layout', data);

		}
		// EO if dimension changed

	}
	// @@@ EO method: postLayout @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// add widget to layout manager
		OCBNET.Layout.add(this);

		// layout user interface
		OCBNET.Layout();

	}, 999);
	// @@@ EO plugin: ready @@@

	prototype.plugin('layout', function (data)
	{

		if (
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
			data.force
		)
		{

			// layout user interface
			OCBNET.Layout();

		}

	}, - 99999);

/*
	// @@@ plugin: updatedPosition @@@
	prototype.plugin('updatedPosition', function()
	{

		// store old dimension
		var vp_x = this.vp_x

		// read viewport dimensions first
		// this will read this.vp_x again
		this.trigger('readviewportDim');

		// redo layout if viewport dimension changed
		if (vp_x != this.vp_x) return OCBNET.Layout();

		// enqueue a defered call to layout
		else OCBNET.Layout.schedule(200, true);

	});
	// @@@ EO plugin: updatedPosition @@@
*/

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Center Opposition in Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ private fn: updatedViewportOpp @@@
	function updatedViewportOpp (vp_y)
	{

		// loop all slides to setup their 3d transformation
		var l = this.panels.length, i = l; while (i--)
		{

			var margin = (vp_y - this.pd[1][i]) / 2;

			jQuery(this.panels[i]).css('top', margin + 'px');

		}
			// EO all panels

	}
	// @@@ EO private fn: updatedViewportOpp @@@


	// run late after the viewport opposition has been changed/updated
	prototype.plugin('changedViewportOpp', updatedViewportOpp, 999);
	prototype.plugin('updatedViewportOpp', updatedViewportOpp, 999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visibile panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport dimension changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: changedViewportDim @@@
	prototype.plugin('changedViewportDim', function ()
	{

		// check if this sizer is enabled
		if (
			(!this.conf.vertical) &&
			this.conf.sizer == 'panelsByViewport'
		)
		{

			// set the panel dimensions from vp_x
			// this will update the panel dom nodes
			// will also recalculate all panel offsets
			this.setSlidesDimFromVp();

			// read the new panel height from UA
			// updates the ps[1] and pd[1] arrays
			this.trigger('readPanelsOpp');


			// this.trigger('layout');

			// update the panel visibility
			this.trigger('readPanelVisibility');

		}

	});
	// @@@ EO plugin: changedViewportDim @@@



	// @@@ method: getSlideDimFromVp @@@
	// get the dimension for the given slide
	prototype.getSlideDimFromVp = function (slide)
	{

		// declare and normalize slide
		// var panel = this.slide2panel(slide),
		//     slide = this.panel2slide(panel);

		// we currently distribute everything evenly to all slides
		// todo: implement a more complex sizer with distribution factors
		return parseInt(this.vp_x / this.conf.panelsVisible + 0.5, 10)

	}
	// @@@ EO method: getSlideDimFromVp @@@


	// @@@ method: setSlidesDimFromVp @@@
	// get the dimension for all slides
	prototype.setSlidesDimFromVp = function()
	{

		// process all slides
		var i = this.slides.length; while (i--)
		{
			// set the slide size to calculated value
			this.setSlideDim(i, this.getSlideDimFromVp(i));
		}

		// calculate the new panel offsets
		// this will update the offset array
		// panel dimensions are taken from pd[0]
		this.updatePanelsOffset();

	}
	// @@@ EO method: setSlidesDimFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: updatedSlideExposure @@@
	prototype.plugin('updatedSlideExposure', function(visibility)
	{

		// local variable
		var dimension = 0;

		// abort if feature is disabled
		if (
			this.conf.vertical ||
			this.conf.sizer == 'viewportByPanels'
		)
		{

			// process all panel visibilites
			for(var i = 0; i < visibility.length; i++)
			{

				// skip if panel is not visible
				if (visibility[i] == 0) continue;

				// sum up dimensions of all panels
				dimension += this.pd[0][i] * visibility[i];

			}

			// set viewport dimension
			this.setViewportDim(dimension);

		}

	});
	// @@@ EO plugin: updatedSlideExposure @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport Height by Visibility Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// extend default configuration
		this.conf = jQuery.extend
		(
			{

				// enable feature
				autoVpOpp: true,

				// panel dead zone
				autoVpOppDeadZone: 0.5

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@

	function viewportOppByVisibility ()
	{

		var visibility = this.s_e;

		// check if feature is enabled
		if (this.conf.vertical) return;
		if (!this.conf.autoVpOpp) return;

		// local variable and dead zone for out of view panel
		var max = 0, dead_zone = this.conf.autoVpOppDeadZone || 1;

		// process all panel visibilites
		for(var i = 0; i < visibility.length; i++)
		{

			// skip if panel is not visible
			if (visibility[i] == 0) continue;

			// check if panel is fully visible
			if (visibility[i] > dead_zone)
			{
				// use full panel height
				max = Math.max(max, this.pd[1][i]);
			}
			else
			{
				// use a partial panel height (distribute from 0 to dead_zone)
				max = Math.max(max, this.pd[1][i] * (visibility[i] / dead_zone));
			}
			// EO if fully visible

		}
		// EO foreach panel visiblity

		// set viewport opposite size
		this.setViewportOpp(max);

		// vp_y never read
		this.vp_y = max;

	}

	// @@@ plugin: changedPanelVisibility @@@

	prototype.plugin('layout', viewportOppByVisibility);

	prototype.plugin('layout', function()
	{

		if (this.conf.vertical)
		{

			this.readPanelsDim();

/*
			this.readPanelsOpp();
			// this.updatePanels()

*/
			this.updatePanelsOffset()
			this.setOffsetByPosition(this.position);
		}

	}, - 99999);


 	// prototype.plugin('updatedSlideExposure', viewportOppByVisibility);

	// @@@ EO plugin: changedPanelVisibility @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Navigation Dots Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// get function checker
	var isFn = jQuery.isFunction;

	// declare here for compiler
	var prefix = 'rtp-nav-dot';

	// @@@ private fn: formatTitle @@@
	// default title format function
	function formatTitle (nr)
	{
		return (nr + 1) + "/" + this.slides.length;
	}
	// @@@ EO private fn: formatTitle @@@


	// @@@ private fn: updateNavDotUI @@@
	// call to setup the styles of a nav dot node
	function updateNavDotUI (slide, progress)
	{

		// classes for selectors
		var class_hidden = this.klass.panelHidden;
		var class_partial = this.klass.panelPartial;
		var class_visible = this.klass.panelVisible;

		// panel if completely visible
		if (progress >= 1)
		{
			this.navDot.eq(slide)
				.addClass(class_visible)
				.removeClass(class_hidden)
				.removeClass(class_partial)
		}
		// panel is not shown at all
		else if (progress <= 0)
		{
			this.navDot.eq(slide)
				.addClass(class_hidden)
				.removeClass(class_partial)
				.removeClass(class_visible)
		}
		// panel is partially visible
		else
		{
			this.navDot.eq(slide)
				.addClass(class_partial)
				.removeClass(class_hidden)
				.removeClass(class_visible)
		}

		// call configured function for styling
		var fn = this.conf.navDotStepFunction;
		// assert that the configured option is a function
		if (jQuery.isFunction(fn)) fn.call(this, slide, progress)

	}
	// @@@ EO private fn: updateNavDotUI @@@


	// @@@ private fn: updateVisibility @@@
	function updateVisibility (visibility)
	{

		// is plugin enabled
		if (this.conf.navDots)
		{

			// call update for each slide nav dot
			for(var i = 0; i < visibility.length; i++)
			{ updateNavDotUI.call(this, i, visibility[i]) }

		}
		// EO if is enabled

	}
	// @@@ EO private fn: updateVisibility @@@


	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{
				// enable plugin
				navDots: false,
				// format for alt and title tag
				navDotAltFormat: formatTitle,
				navDotTitleFormat: formatTitle,
				// this function is responsible to change styles
				// progress will be in the range of 0 to 1 (100%)
				navDotStepFunction: function(slide, progress)
				{
					// the default method is to change the opacity
					this.navDotImg.eq(slide).css('opacity', progress);
				}
			},
			this.conf
		);

		// default configuration
		this.klass = jQuery.extend
		(
			{
				navDot: prefix,
				panelHidden: prefix + '-hidden',
				panelPartial: prefix + '-partial',
				panelVisible: prefix + '-visible'
			},
			this.klass
		);

		// default configuration
		this.tmpl = jQuery.extend
		(
			{
				navDotWrapper: ['<span><a href="javascript:void(0);">', '</a></span>'],
				navDotElement: '<img src="img/rtp-nav-dot-clear.gif" width="12" height="12" alt=""/>'
			},
			this.tmpl, this.conf.tmpl
		);

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// create closure
		var self = this;

		// activate autoslide
		if (self.conf.navDots)
		{

			// only if more than one slide
			if (self.slides.length > 1)
			{

				// store nav dots and nav dot images
				self.navDot = jQuery(), self.navDotImg = jQuery();

				// create the wrapper around all nav dots
				self.navDotWrapper = jQuery('<div class="' + prefix + 's">');

				// create a representation for each slide
				self.slides.each(function (i)
				{

					// create a new jquery dom object
					var navDot = jQuery(
						self.tmpl.navDotWrapper[0] +
							self.tmpl.navDotElement +
						self.tmpl.navDotWrapper[1]
					)

						// add generic class to the item
						.addClass(self.klass.navDot)
						// add specific class to the item (with nr)
						.addClass([self.klass.navDot, i].join('-'))

						// attach click handler to the nav dot
						.click(function () { self.animate(i); })

						// append object to wrapper
						.appendTo(self.navDotWrapper)

					// get the nav dot image node
					var navDotImg = jQuery('IMG', navDot)

					// set some attributes for the image (overwrite format functions to personalize)
					if (isFn(self.conf.navDotAltFormat)) navDotImg.attr('alt', self.conf.navDotAltFormat.call(self, i));
					if (isFn(self.conf.navDotTitleFormat)) navDotImg.attr('title', self.conf.navDotTitleFormat.call(self, i));

					// collect all real dom nodes
					self.navDot.push(navDot.get(0));
					self.navDotImg.push(navDotImg.get(0));

					// setup the styles of this dot
					updateNavDotUI.call(self, i, 0);

				});

				// append wrapper to the main slider wrapper
				self.navDotWrapper.appendTo(self.wrapper);

				// self.navDotWrapper.wrap('<div class="rtp-nav-dots-outer">');
				// self.navDotWrapper.wrap('<div class="rtp-nav-dots-wrapper">');

			}
			// EO if slides > 1

		}
		// EO if conf.autoslide

	});
	// @@@ plugin: init @@@


	// execute when slide visibility is changed (actual visibility)
	prototype.plugin('changedSlideVisibility', updateVisibility);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Navigation Arrows Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ updateUI @@@
	var updateUI = function(duration)
	{

		// get the prev/next nodes
		var prev = this.arrows.prev;
		var next = this.arrows.next;

		// is carousel mode?
		if (this.conf.carousel)
		{

			// prev/next links are always shown in carousel mode
			if(!prev.is(':visible')) prev.stop(true, true).show();
			if(!next.is(':visible')) next.stop(true, true).show();

		}
		else
		{

			// show/hide prev/next scroll navigation by slide position
			if (isNaN(duration)) duration = this.conf.slideEaseDuration;

			if(this.position < this.smin + 1) // show/hide prev links
			{ if(prev.is(':visible')) prev.stop(true, true).fadeOut(duration); }
			else { if(!prev.is(':visible')) prev.stop(true, true).fadeIn(duration); }

			if(this.position > this.smax - 1) // show/hide next links
			{ if(next.is(':visible')) next.stop(true, true).fadeOut(duration); }
			else { if(!next.is(':visible')) next.stop(true, true).fadeIn(duration); }

		}

	}
	// @@@ EO updateUI @@@

	// hook into rtp slider class
	prototype.plugin('layout', updateUI);

	// hook into rtp slider class
	prototype.plugin('init', function()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{
				navArrows: false, // should we generate navigation arrows
				navArrowAttach: 'wrapper', // wrapper or panels
				navArrowPosition: 'default', // prepend, reverse, append
				navArrowPrevText: '&#171; left', // text/html for the previous link
				navArrowNextText: 'right &#187;' // text/html for the next link
			},
			this.conf
		);

		// default templates
		this.tmpl = jQuery.extend
		(
			{
				'arrow-prev' : ['<div class="rtp-nav-prev"><a href="javascript:void(0)">', '</a></div>'],
				'arrow-next' : ['<div class="rtp-nav-next"><a href="javascript:void(0)">', '</a></div>']
			},
			this.tmpl, this.conf.tmpl
		);

		// default templates
		this.selector = jQuery.extend
		(
			{
				'nav-prev' : '.rtp-nav-prev A',
				'nav-next' : '.rtp-nav-next A'
			},
			this.selector, this.conf.selector
		);

		// declare and init navigation arrows
		this.arrows = { prev : jQuery(), next : jQuery() };

		// initialize navigation arrows
		if (this.conf.navArrows)
		{

			// get default methods for the insert
			var navPositionNext = this.viewport.append;
			var navPositionPrev = this.viewport.prepend;

			// switch positions by given configuration
			switch(this.conf.navArrowPosition.substr(0,1))
			{
				case 'r':
					navPositionPrev = this.viewport.append;
					navPositionNext = this.viewport.prepend;
				break;
				case 'p':
					navPositionNext = this.viewport.prepend;
				break;
				case 'a':
					navPositionPrev = this.viewport.append;
				break;
			}

			// where should the arrows be attached to (inside each panel or once for all within wrapper)
			var el = this.conf.navArrowAttach.substring(0,1) == 'p' ? this.panels : this.wrapper;

			// add prev/next navigation items (will be shown or hidden by other application settings)
			var txt_prev = this.conf.navArrowPrevText, txt_next = this.conf.navArrowNextText;
			if (txt_prev) navPositionPrev.call(el, this.tmpl['arrow-prev'][0] + txt_prev + this.tmpl['arrow-prev'][1]);
			if (txt_next) navPositionNext.call(el, this.tmpl['arrow-next'][0] + txt_next + this.tmpl['arrow-next'][1]);

			// get the actual dom nodes by selecting them from the wrapper
			this.arrows.prev = this.wrapper.find(this.selector['nav-prev']);
			this.arrows.next = this.wrapper.find(this.selector['nav-next']);

			// attach prev/next arrow click (prevent event bubbeling)
			if (this.arrows.prev) this.arrows.prev.click(jQuery.proxy(function() { this.goPrev(); return false; }, this));
			if (this.arrows.next) this.arrows.next.click(jQuery.proxy(function() { this.goNext(); return false; }, this));

			// update ui immediately
			updateUI.call(this, 0);

		};
		// EO if conf.navArrows

	});
	// EO init hook

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Keyboard Navigation Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				// should we enable keyboard navigation
				navKeyboard : false,
				// jquery keycode for prev action
				navKeyboardPrev : this.conf.vertical ? 38 : 37,
				// jquery keycode for next action
				navKeyboardNext : this.conf.vertical ? 40 : 39

			},
			this.conf
		);

	});
	// @@@ EO plugin: init @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// initialize keyboard navigation
		if (this.conf.navKeyboard)
		{
			// bind to keyboard event on document scope
			jQuery(document).keydown(jQuery.proxy(function (evt)
			{
				// only capture without any modifier combination (ie. for opera tabbing)
				if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return true;
				// map key to slider function
				switch (evt.which)
				{
					case this.conf.navKeyboardPrev: this.goPrev(); break;
					case this.conf.navKeyboardNext: this.goNext(); break;
				}

			}, this));
		}

	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
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

	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// extend default configuration
		this.conf = jQuery.extend
		(
			{

				// class for current panel
				curClass: 'current',

				// panel dead zone
				curClassDeadZone: 0.25

			},
			this.conf
		);

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
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Auto Slide Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: init @@@
	prototype.plugin('config', function()
	{

		// store autoslide timer
		// if autosliding is set to true it is paused and can
		// be restartet. if autosliding is false no auto slider
		// should be running, when running the timeout is stored
		this.autosliding = null;

		// default configuration
		this.conf = jQuery.extend
		(
			{

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

			},
			this.conf
		);

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


	// @@@ private fn: toggleInfoBox @@@
	function toggleInfoBox (opacity, duration)
	{

		// create closure
		var slider = this;

		// check if queue is empty
		// if (slider.queue.length == 0)
		// {

			// get all panels for the current slide
			var panels = slider.getPanelsBySlide(slider.position);

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
		toggleInfoBox.call(this, 0, 300);

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
	prototype.plugin('postAnimation', function() { toggleInfoBox.call(this, 1, 700) })

	// hide info boxes before the main animation started (aquire locks)
	prototype.plugin('preAnimation', function() { toggleInfoBox.call(this, 0, 700) })


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
/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Core Swipe Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	/*
	   This function is used to calculate the speed when
	   the user releases the mouse or swipe gesture.
	   We record the positions of the points and the timestamp,
	   then this function calculates the average speed.
	   http://en.wikipedia.org/wiki/Least_squares
	   http://pcbheaven.com/wikipages/The_Least_Squares_Fitting/
	*/
	var LeastSquaresFitting = function (points)
	{

		// no result if less than 2 points given
		if (points.length < 2) return [0, 0];

		// get a timestamp from current time
		var timestamp = points[0][2];

		// declare variables to calculate the sums
		var sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;

		for (var i = 0, l = points.length; i < l; i++)
		{

			var y = points[i][0], x = points[i][2] - timestamp;

			sum_x += x; sum_xx += x * x;
			sum_y += y; sum_xy += x * y;

		}

		var m = (l * sum_xy - sum_x * sum_y) / (l * sum_xx - sum_x * sum_x);
		var n = (sum_y * sum_xx - sum_x * sum_xy) / (l * sum_xx - sum_x * sum_x);

		if (isNaN(m)) console.log(sum_x, sum_xx, sum_y, sum_xy, points);

		return [m, n];

	};


	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// status variable
		this.swipe = false;

		// default configuration
		this.conf = jQuery.extend
		(
			{
				// frames per second
				// draw rate while swiping
				fps: 25,
				// synchronise draw with the
				// actual live swipe movement
				swipeVsync: false,
				// pixel offset before fixing direction
				// from then on we either scroll or swipe
				swipeThreshold : 5
			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: swipeStart @@@
	prototype.plugin('swipeStart', function (x, y, data)
	{

		// pause autoslider if it's active at the moment
		if (this.autoSlidePause) this.autoSlidePause();

		// assert that, when swiping is given, animation lock is set
// 		if (this.locked && !this.animation) alert('invalid status');

		// lock the animations
		this.animation = true;

		// store last moves
		data.swipeMoves = [];
		// init direction status variables
		data.swipeDrag = data.swipeScroll = false;
		// store the start positions for this swipe
		data.swipeStartDrag = data.swipeX = x;
		data.swipeStartScroll = data.swipeY = y;

		// get viewport offset
		var vp_off = this.getViewportOffset();

		var offset = this.ct_off + x - vp_off.x;

data.vp_off = vp_off.x;

		// get the position where the drag has been started / initiated (point of interest)
		data.swipeStartDragPos = this.getPositionByOffset(offset);
		data.swipeStartPositionOff = this.getOffsetByPosition(this.position) - offset;

		// we are now going to swipe
		this.locked = true;

		// abort all other animations
		this.trigger('abortAnimation');

	});
	// @@@ EO plugin: swipeStart @@@


	// @@@ plugin: swipeDraw @@@
	prototype.plugin('swipeDraw', function (data)
	{

		var x = data.swipeX,
		    y = data.swipeY;

		var offset = data.swipeStartDrag - x;

		data.swipeStartDrag = x;

		return this.setPosition(this.getPositionByOffset(this.getOffsetByPosition(this.position) +	 offset))

	})
	// @@@ EO plugin: swipeDraw @@@


	// @@@ plugin: swipeMove @@@
	prototype.plugin('swipeMove', function (x, y, data)
	{

		this.swiping = true;

		// get from data into local variable
		// usefull for performance and minimizing
		var moves = data.swipeMoves;

		// store current swipe position
		data.swipeX = x; data.swipeY = y;

		// try to determine the prominent axis for this swipe movement
		if (data.swipeDrag == false && data.swipeScroll == false)
		{
			// threshold to determine/fix direction
			var threshold = this.conf.swipeThreshold;
			// check if there was an initial minimum amount of movement in some direction
			if (Math.abs(data.swipeStartDrag - x) > threshold) { data.swipeDrag = true; }
			else if (Math.abs(data.swipeStartScroll - y) > threshold) { data.swipeScroll = true; }
		}

		// check if this move is going into another direction then before
		// ToDo: Could also add a threshold that a small back move will be tolerated
		var length = moves.length; if (length > 2)
		{
			if (moves[length-2][0] < moves[length-1][0] && moves[length-1][0] > x) { moves.length = 0; }
			else if (moves[length-2][0] > moves[length-1][0] && moves[length-1][0] < x) { moves.length = 0; }
		}

		// do not record to many steps (memory usage)
		if (moves.length > 50) moves.shift();

		// push the coordinates with timestamp to our data array
		moves.push([x, y, (new Date()).getTime()]);

		// try to determine the prominent axis for this swipe movement
		if (data.swipeDrag == false && data.swipeScroll == false)
		{
			// threshold to determine/fix direction
			var threshold = this.conf.swipeThreshold;
			// check if there was an initial minimum amount of movement in some direction
			if (Math.abs(data.swipeStartDrag - x) > threshold) { data.swipeDrag = true; }
			else if (Math.abs(data.swipeStartScroll - y) > threshold) { data.swipeScroll = true; }
		}

		// abort this event if not dragging
		if (!data.swipeDrag) return true;

		// check for config option
		if (this.conf.vsync)
		{
			// synchronize action with monitor
			this.trigger('swipeDraw', data);
		}
		else
		{
			// defer draw to achieve the wished frame rate (approx)
			this.defer(1000 / this.conf.fps, 'swipeDraw', data);

		}

		// return false if dragging
		return ! data.swipeDrag;

	});
	// @@@ EO plugin: swipeMove @@@


	// @@@ plugin: swipeStop @@@
	prototype.plugin('swipeStop', function (x, y, data)
	{

		// abort all other animations
		this.trigger('abortAnimation');

		// get from data into local variable
		// usefull for performance and minimizing
		var moves = data.swipeMoves;

		// first call swipe move to do some work
		this.trigger('swipeMove', x, y, data);

		// clear swipe draw timer
		this.undefer('swipeDraw');

		// get a timestamp from current time
		var timestamp = (new Date()).getTime();

		// get the limiting timestamp for moves
		var limit = timestamp - 500;

		// remove all moves that happend before our limit
		while (moves.length && moves[0][2] < limit) moves.shift();

		// get fitted linear function parameters
		var least = LeastSquaresFitting(moves);

		// linear fn -> y = m*x + n
		var m = least[0], n = least[1];

		// check to which position we will swipe
		var to = parseInt(this.position + 0.5 + m * -0.4)

		// get absolute speed
		var speed = Math.abs(m);

		// unlock slider
		this.locked = false;

		// abort all other animations
		this.trigger('abortAnimation');

		// first call swipe move to do some work
		this.trigger('swipeFinish', x, y, data);

		var duration = 0, easing = 'linear',
		    offset = Math.abs(to - this.position);

		if (offset > 0.5)
		{
			easing = speed < 0.375 ? 'easeOutBounce' : 'easeOutExpo';
			duration = Math.max(Math.min(100 / Math.pow(1/speed, 1.5), 9000), 1200);
		}
		else if (offset > 0)
		{
			easing = speed < 0.375 ? 'easeOutBounce' : 'easeOutExpo';
			duration = Math.max(Math.min(100 / Math.pow(1/speed, 1.5), 2000), 600);
		}

		var swipeDrag = data.swipeDrag;

		delete data.swipeDrag;
		delete data.swipeScroll;
		data.swipeMoves = [];

		this.animate(to, duration, easing, function ()
		{

			this.foobar = false;
			this.swiping = false;

		}, true);

		// return false if dragging
		return ! swipeDrag;

	});
	// @@@ EO plugin: swipeStop @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
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

	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				// enable mouse swipes
				mouseSwipe : false

			},
			this.conf
		);

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
		this.trigger('swipeMove', swipe, scroll, data);

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

	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				// enable touch swipes
				touchSwipe : false

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// some private functions usefull for callbacks
	var abort_handler = function(data, evt) { return false; }
	// var success_handler = function(data, evt) { return true; }


	// attach to event types
	var evt_stop = 'touchend';
	var evt_move = 'touchmove';
	var evt_start = 'touchstart';
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
		var touch = data.toucher,
		    vertical = this.conf.vertical,
		    swipe = vertical ? touch.clientY : touch.clientX,
		    scroll = vertical ? touch.clientX : touch.clientY;

		// call swipe move handler with coordinates
		this.trigger('swipeMove', swipe, scroll, data, evt);

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

	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);


/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Toolbar Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// declare here for compiler
	var prefix = 'rtp-toolbar';

	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				navToolbar: false,

				// enable feature
				// toolbar: 'first, rewind, pause, stop, play, toggle-stop, toggle-pause, forward, last'
				navToolbarButtons: this.conf.carousel ?
					'rewind, toggle-stop, toggle-pause, forward' :
					'first, rewind, toggle-stop, toggle-pause, forward, last'

			},
			this.conf
		);

		// default configuration
		this.klass = jQuery.extend
		(
			{
				// navDot: prefix,
				// panelHidden: prefix + '-hidden',
				// panelPartial: prefix + '-partial',
				// panelVisible: prefix + '-visible'
			},
			this.klass
		);

		// default configuration
		this.tmpl = jQuery.extend
		(
			{
				navButtonWrapper: ['<a href="javascript:void(0);">', '</a>'],
				navButton: '<img src="img/rtp-toolbar-{type}.gif" width="12" height="12" alt="{title}"/>'
			},
			this.tmpl
		);
	});
	// @@@ EO plugin: config @@@

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// create closure
		var self = this;

		self.buttons = {};

		function action (type)
		{

			switch (type)
			{

				case 'first':
					this.goFirst()
				break;
				case 'rewind':
					this.goPrev()
				break;
				case 'play':
					this.startAutoSlide();
				break;
				case 'pause':
					this.stopAutoSlide(true);
				break;
				case 'stop':
					this.stopAutoSlide(false);
				break;
				case 'toggle-pause':
					if (this.autosliding)
					{ this.stopAutoSlide(true); }
					else { this.startAutoSlide(); }
				break;
				case 'toggle-stop':
					if (this.autosliding !== null)
					{ this.stopAutoSlide(false); }
					else { this.startAutoSlide(); }
				break;
				case 'forward':
					this.goNext()
				break;
				case 'last':
					this.goLast()
				break;

			}

		}

		// activate autoslide
		if (self.conf.navToolbar)
		{

			var buttons = self.conf.navToolbarButtons.split(/\s*,\s*/), nodes = [];

			// create the wrapper around all nav dots
			var wrapper = jQuery('<div class="' + prefix + '">');

			for (var i = 0, l = buttons.length; i < l; i++)
			{
				var button = jQuery(
					'<span class="rtp-toolbar-' + buttons[i] + '">'
					+ self.tmpl.navButtonWrapper[0]
					+ self.tmpl.navButton
					   .replace(/{type}/g, buttons[i].replace('toggle-', ''))
				     .replace(/{title}/g, buttons[i])
					+ self.tmpl.navButtonWrapper[1]
					+ '</span>'
				).click(jQuery.proxy(action, self, buttons[i]));
				wrapper.append(self.buttons[buttons[i]] = button);
			}

			self.toolbarWrapper = wrapper;

			// append wrapper to the main slider wrapper
			self.toolbarWrapper.appendTo(self.wrapper);

		}
		// EO if conf.autoslide


	});
	// @@@ EO plugin: init @@@

	var togglers = [ 'stop', 'pause' ];

	function updateToggleButtons ()
	{

		var n = 0;

		var imgs = this.buttons['toggle-' + togglers[n]];

		imgs = imgs ? imgs.find('IMG') : [];

		var i = imgs.length; while (i--)
		{
			if (this.autosliding !== null)
			{
				imgs[i].src = imgs[i].src.replace('play', togglers[n]);
			}
			else
			{
				imgs[i].src = imgs[i].src.replace(togglers[n], 'play');
			}
		}

		n = 1;

		var imgs = this.buttons['toggle-' + togglers[n]];

		imgs = imgs ? imgs.find('IMG') : [];

		var i = imgs.length; while (i--)
		{
			if (this.autosliding)
			{
				imgs[i].src = imgs[i].src.replace('play', togglers[n]);
			}
			else
			{
				imgs[i].src = imgs[i].src.replace(togglers[n], 'play');
			}
		}


	}

	// @@@ plugin: autoslidePause @@@
	prototype.plugin('ready', updateToggleButtons);
	prototype.plugin('autoslideStop', updateToggleButtons);
	prototype.plugin('autoslideStart', updateToggleButtons);
	prototype.plugin('autoslidePause', updateToggleButtons);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
// taken from http://api.jquery.com/jQuery.cssHooks/

(function($) {

	if ( !$.cssHooks )
	{
		throw("jQuery 1.4.3+ is needed for this plugin to work");
		return;
	}

	var css3 = [
		'boxSizing',
		'transform',
		'perspective',
		'transformStyle',
		'backfaceVisibility'
	];

	function styleSupport( prop )
	{

		var vendorProp, supportedProp,
		    capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
		    prefixes = [ "Moz", "Webkit", "O", "ms" ],
		    div = document.createElement( "div" );

		if ( prop in div.style )
		{
			supportedProp = prop;
		}
		else
		{
			for ( var i = 0; i < prefixes.length; i++ )
			{
				vendorProp = prefixes[i] + capProp;
				if ( vendorProp in div.style )
				{
					supportedProp = vendorProp;
					break;
				}
			}
		}

		div = null;

		$.support[ prop ] = supportedProp

		return supportedProp;

	}

	var i = css3.length; while (i--)
	{

		(function()
		{

			var attr = css3[i],
					support = styleSupport( attr );

			// Set cssHooks only for browsers that
			// supports a vendor-prefixed style only
			if ( support && support !== attr )
			{
				$.cssHooks[attr] =
				{
					get: function( elem, computed, extra )
					{
						return $.css( elem, support );
					},
					set: function( elem, value)
					{
						elem.style[ support ] = value;
					}
				};
			}

		})()

	}

})(jQuery);

/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Carousel 3D Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				// enable feature
				carousel3d: false

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// conversion constants
	// var deg2rad = Math.PI/180;
	// var rad2deg = 180/Math.PI;

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// create closures for functions
		// only calculate on layout update
		var angle, paneldim, distance;

		// save and store to old method (to be restored later)
		oldSetOffsetByPosition = this.setOffsetByPosition;

		// @@@ private fn: setOffsetByPosition @@@
		function setOffsetByPosition (position)
		{

			// check if feature is enabled
			if (!this.conf.carousel3d)
			{

				// call original method if feature is disabled
				return oldSetOffsetByPosition.apply(this, arguments);

			}
			// EO if feature not enabled

			// now calulate the rotation for this position
			var rotate = 360 / this.slides.length * position;

			var dir = this.conf.vertical ? 'X' : 'Y';

			// set 3d container styles
			this.container.css({

				// rotate the 3d panel and move it aways from the 3d center
				// transform: 'translateZ(-' + distance + 'px) rotate' + dir + '(-' + rotate + 'deg)'
				transform: 'translateZ(-' + distance + 'px) rotate' + dir + '(-' + rotate + 'deg)'

			});

		}
		// @@@ EO private fn: setOffsetByPosition @@@


		// @@@ private fn: layout @@@
		function layout ()
		{

			// check if feature is enabled
			if (!this.conf.carousel3d) return;

			// declare local variables
			var conf = this.conf,
			    alignPanel = conf.alignPanel,
			    alignViewport = conf.alignViewport,
			    panelsVisible = conf.panelsVisible;

			// get segment angle at center (in radians)
			var angle = Math.PI / this.slides.length;

			// calculate maxium panel dimension and take half
			var paneldim = Math.max.apply( Math, this.pd[0] ) / 2;

			// calculate the panel distances (3d) from the center
			distance = parseInt(paneldim / Math.tan(angle), 10);

			// calculate the alignment / offset position (use panelsVisible to assume viewport)
			var align = panelsVisible * (alignViewport - 0.5) - alignPanel + 0.5

			// setup 3d panels
			this.panels.css({

				// use absolute position
				position : 'absolute',
				left : '0px', right : '0px',

				// force anti aliasing in firefox
				outline: '1px solid transparent'

			});

			// hide cloned panels
			this.cloned.hide();

			var dir = this.conf.vertical ? 'X' : 'Y';

			// loop all slides to setup their 3d transformation
			var l = this.slides.length, i = l; while (i--)
			{

				// get rotation for this panel
				var rotate = 360 / l * i + align;

				// set all 3d panel styles
				jQuery(this.slides[i]).css({

					// rotate the 3d panel and move it aways from the 3d center
					transform: 'rotate' + dir + '(' + rotate + 'deg) translateZ( ' + distance + 'px )'

				});

			}
			// EO all slides

			// setup 3d viewport styles
			this.viewport.css({
				// 'overflow': 'hidden',
				'perspective': distance * panelsVisible / 2
			});

			// setup 3d container styles
			this.container.css({
				'width': '100%',
				'overflow': 'visible',
				'transform-style': 'preserve-3d'
			});

		}
		// @@@ EO private fn: layout @@@


		// overwrite setOffsetByPosition method
		// do this on each instance not on prototype
		this.setOffsetByPosition = setOffsetByPosition;

		// setup the 3d carousel on layout event
		prototype.plugin('layout', layout, - 9);


	});
	// @@@ EO plugin: init @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
