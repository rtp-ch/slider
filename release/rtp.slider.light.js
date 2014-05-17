/*
  RTP.Slider.js - minimal release
  https://github.com/mgreter/slider
*/;
/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider 0.10.0
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/;
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
(function (prototype)
{

	// get function checker
	var isFn = jQuery.isFunction;

	// @@@ request a new prerequisite that must be satisfied @@@
	prototype.prerequisite = function(arg)
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
	prototype.finish = function()
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
})(RTP.Multievent.prototype);;
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

	// frames per second to layout
	// only needed when not in vsync mode
	var fps = 60;

	// store scheduled timeout
	var scheduled;

	// widgets without parent
	var roots = jQuery();

	// widgets to be layouted
	var widgets = jQuery();

	// old body overflow style
	var overflow_x, overflow_y;

	// get the user agent string in lowercase
	// copy feature from jquery migrate plugin
	// this was included in jquery before v1.9
	var ua = navigator.userAgent.toLowerCase();

	// only match for ie and mozilla so far
	var match = // /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	            // /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	            // /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	            /(msie) ([\w.]+)/.exec( ua ) ||
	            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	            [];

	// get splitted information about the user agent
	var browser = match[ 1 ] || '', version = match[ 2 ] || '0';

	// defer the resize event and filter multiple calls
	// this is a bugfix for ie 8 where the resize event may is
	// triggered multiple times when scrollbars appear/disappear
	var vsync = ! browser == 'msie' || parseInt(version, 10) != 8;

	// get firefox mode on startup / initialization
	// firefox will show both scrollbars when the layout
	// does not 'fit' perfectly. All other browsers will
	// only show the scrollbar in the direction needed.
	var firefox_overflow = browser == 'mozilla';

	// use requestAnimationFrame to defer functions
	// this seems to work quite well, so include it
	var setDefered = window.requestAnimationFrame,
	    clearDefered = window.cancelAnimationFrame ||
	                   window.cancelRequestAnimationFrame;

	// search for requestAnimationFrame by vendor
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	// loop vendors until the request animation frame function is found
	for(var x = 0; x < vendors.length && !setDefered; ++x)
	{
		setDefered = window[vendors[x]+'RequestAnimationFrame'];
		clearDefered = window[vendors[x]+'CancelAnimationFrame'] ||
		               window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	// create function to take out delay argument (returns identifier)
	if (setDefered) var callDefered = function (cb) { return setDefered(cb); };

	// use timeouts as a fallback
	if (!callDefered) callDefered = window.setTimeout;
	if (!clearDefered) clearDefered = window.clearTimeout;

	// remember default functions
	var defCallDefered = callDefered;
	var defClearDefered = clearDefered;

	// static local function
	// call function on all widgets
	function exec(fn, data, widgets)
	{

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// call method in widget context
			if (jQuery.isFunction(widgets[i][fn]))
			{ widgets[i][fn].call(widgets[i], data); }

		}

	}
	// EO exec


	// static local function
	// call function on all widgets
	function layout(data, widgets)
	{

		// first call pre on all widgets
		exec('preLayout', data, widgets);

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// get childrens for widget from options
			var children = widgets[i].layout.children;

			// call layout for all childrens
			if (children && children.length)
			{ layout(data, children); }

		}

		// then call update on all widgets
		exec('postLayout', data, widgets);

	}
	// EO layout

	// static local function
	// call function on all widgets
	function finalize(data, widgets)
	{

		// first call post on all widgets
		exec('updateLayout', data, widgets);

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// get childrens for widget from options
			var children = widgets[i].layout.children;

			// call finalize for all childrens
			if (children && children.length)
			{ finalize(data, children); }

		}

	}
	// EO finalize


	// static global function
	// do the layout on all widgets
	function Manager (force, widgets)
	{

		// shared data (assign flag)
		var data = { force: force };

		// get nodes to manage in this run
		var nodes = widgets ? jQuery(widgets) : roots;

		// restore the previous overflow style on the document body
		// needed so our layout can trigger the scrollbar to appear/disapear
		if (overflow_y) { body.css('overflow-y', overflow_y); overflow_y = null; }
		if (overflow_x) { body.css('overflow-x', overflow_x); overflow_x = null; }

		// get the initial dimensions
		var body_1st_x = win.innerWidth();
		var body_1st_y = win.innerHeight();

		// reflow layout
		layout(data, nodes);

		// get the dimensions afterwards
		var body_2nd_x = win.innerWidth();
		var body_2nd_y = win.innerHeight();

		if (body_1st_x != body_2nd_x || body_1st_y != body_2nd_y)
		// if (body_1st_x > body_2nd_x || body_1st_y > body_2nd_y)
		{

			// reflow layout
			layout(data, nodes);

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
				layout(data, nodes);

			}
			// EO if 2nd changed

		}
		// EO if 1st changed

		// execute last (only once)
		finalize(data, nodes);

	};
	// EO Manager


	// static global function
	Manager.config = function (key, value)
	{

		// assign config option
		switch (key)
		{
			case 'fps': fps = value; break;
			case 'vsync': vsync = value; break;
			case 'default':
				callDefered = defCallDefered;
				clearDefered = defClearDefered;
			break;
			case 'fallback':
				callDefered = window.setTimeout;
				clearDefered = window.clearTimeout;
			break;
		}

		// reassign the resizer function
		resizer = vsync ? function () { Manager(); } : deferer;

	};
	// EO config

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


	// EO Manager.defer
	Manager.defer = function (fn, delay)
	{
		// delay is optional
		if (typeof delay == 'undefined')
		{ delay = 1000 / fps; }
		// add scheduled function
		return callDefered(fn, delay);
	}
	// EO Manager.defer

	// EO Manager.undefer
	Manager.undefer = function (scheduled)
	{
		// clear scheduled function
		return clearDefered(scheduled);
	}
	// EO Manager.undefer


	// static global function
	// add a widget under our control
	Manager.add = function (widget)
	{

		// assign the body object only once
		if (!body) body = jQuery('BODY:first');

		// extend/initialize layout options property
		widget.layout = jQuery.extend({ children: [] }, widget.layout)

		// check if widget has a parent with children
		// add ourself to our parent's children array
		if (widget.layout && widget.layout.parent)
		{
			if (!widget.layout.parent.layout.children)
			{ widget.layout.parent.layout.children = []; }
			widget.layout.parent.layout.children.push(widget);
		}
		// otherwise it's a root widget without parent
		else { roots = roots.add(jQuery(widget)); }

		// call start layout hook on widget
		if (jQuery.isFunction(widget.startLayout))
		{ widget.startLayout.call(widget); }

		// jQueryfy input argument
		widget = jQuery(widget);

		// attach resize event to call resizer
		if (widgets.length == 0 && widget.length > 0)
		{ jQuery(window).bind('resize', resizer); }

		// push instances to static array
		widgets = widgets.add(widget)

		// make static array a global
		// Manager.widgets = widgets;
		// Manager.roots = roots;

	};
	// EO Manager.add


	// static global function
	// add a widget under our control
	Manager.del = function (widget)
	{

		// call stop layout hook on widget
		if (jQuery.isFunction(widget.stopLayout))
		{ widget.stopLayout.call(widget); }

		// jQueryfy input argument
		widget = jQuery(widget);

		// remove from static arrays
		widgets = widgets.not(widget)
		roots = roots.not(widget);

		// remove the resize handler when there are no widgets left
		if (widgets.length == 0) jQuery(window).unbind('resize', resizer);

		// make static array a global
		// Manager.widgets = widgets;
		// Manager.roots = roots;

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

		}, 1000 / fps)

	}
	// @@@ EO function: deferer @@@


	// Set resizer to the desired function to execute.
	// Set this on initialization as the decision is always
	// based on information that must not change during runtime.
	// Will be bound to resize event when first widget is added.
	var resizer = vsync ? function () { Manager(); } : deferer;


	// make sure our global namespace exists
	// but do not reset it if already present
	if (typeof OCBNET == 'undefined') OCBNET = {};

	// assign class to global namespace
	OCBNET.Layout = Manager;


})(jQuery);
// EO private scope;
/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// START anonymous scope
(function(jQuery)
{

	'use strict';


	// declare our namespace
	if (!window.RTP) window.RTP = {};


	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */
	RTP.Slider = function (el, options)
	{

		// create closure for
		// resize event handler
		var slider = this;

		// only init once
		if (slider.inited) { return; }
		else { slider.inited = true; }

		// create new config by extending with data array
		// data options take priority over instance options
		var conf = jQuery.extend(true, {}, options, jQuery(el).data());

		// connect parent layout widget
		slider.layout = { parent: options.parent };

		// @@@ private fn: extend @@@
		function defaults (config)
		{

			// create new config
			slider.conf = {};

			// add more (default) configuration options (deep extend)
			// preserves the already set configuration (just set default)
			return conf = jQuery.extend(true, slider.conf, config, conf);

		}
		// @@@ EO private fn: extend @@@

		// add defaults
		defaults({

			// the panel alignment to the position
			align: 'center',

			// inherits from align
			alignPanelDim: false,
			alignPanelOpp: false,
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

			// frames per second to draw
			// defer all position updates
			// leave the UA some idle loops
			fps: 25,
			// synchronise with monitor
			// draw as soon as requested
			vsync: false,

			// we often want to have margin between
			// the slides, but still want to fill the
			// while viewport. Computation of this is
			// tricky, so I've added this static option.
			margin: 0,

			// how many panels should be cloned
			// if this is set to true, we will use
			// the panelsVisible option for this
			// set to false to disable cloning
			clonePanels: true,

			// in which direction should we clone
			// adds cloned panels before or after
			cloneAfter: true,
			cloneBefore: true,

			// define which axis of the panel is fixed
			// the other axis can be fluid by some ratio
			// this is possible by having an image inside
			// which spans to 100% in both directions
			// may gets overwritten by panelsByViewport sizer
			panelFixedAxis: conf.vertical ? 'opp' : 'dim',

			// initialize some structures
			// they can be used by plugins

			// localized texts
			text: {},

			// templates fragments
			tmpl:
			{
				wrapper : '<div/>',
				viewport : '<div/>',
				container : '<div/>'
			},

			// classes to assign
			klass:
			{
				next: 'rtp-slider-next',
				current: 'rtp-slider-current',
				previous: 'rtp-slider-previous',
				vertical: 'rtp-slider-vertical',
				horizontal: 'rtp-slider-horizontal',
				panel : 'rtp-slider-panel',
				wrapper: 'rtp-slider-wrapper',
				viewport : 'rtp-slider-viewport',
				container : 'rtp-slider-container'
			}

		});
		// EO extend config

		// execute all config hooks
		// this will add more defaults
		slider.trigger('config', defaults);

		// assign shortcuts to access nested config
		jQuery(['text', 'tmpl', 'klass', 'selector'])
		.each(function() { slider[this] = conf[this]; })

		// optimize for compiler
		var tmpl = slider.tmpl,
		    klass = slider.klass,
		    selector = slider.selector;

		// assertion for some options
		if (isNaN(conf.align))
		{ conf.align = 0.5; }
		if (isNaN(conf.panelsVisible))
		{ conf.panelsVisible = 1.0; }

		// current element is used as our container
		var container = slider.container = jQuery(el);

		// get all intial panels (slides) once at startup (after config)
		var slides = slider.slides = container.find('>.' + klass.panel);

		// don't init further if there is only a single slide
		if (conf.dontInitSingle && slides.length < 2) return;

		// put viewport around container
		var viewport = slider.viewport = container
			.wrapAll(tmpl.viewport).parent();

		// put wrapper around viewport
		var wrapper = slider.wrapper = viewport
			.wrapAll(tmpl.wrapper).parent();

		// move all attributes from container to viewport
		var attrs = el.attributes, idx = attrs.length;

		// process all attributes
		while (idx--)
		{
			// copy the attribute from container to viewport
			viewport.attr(attrs[idx].name, attrs[idx].value);
			// remove the attribute on the container
			container.removeAttr(attrs[idx].name);
		}

		// force the container to have no margin and padding
		container.css({ 'margin' : '0', 'padding' : '0' });

		// add default class to all elements
		wrapper.addClass(klass.wrapper);
		viewport.addClass(klass.viewport);
		container.addClass(klass.container);

		// min and max index for slides
		slider.smin = slider.smax = 0;

		// mark wrapper indicating vertical/horizontal mode
		if (conf.vertical && klass.vertical)
		{ slider.wrapper.addClass(klass.vertical); }
		if (!conf.vertical && klass.horizontal)
		{ slider.wrapper.addClass(klass.horizontal); }

		// first slide to load may be a function
		slider.position = jQuery.isFunction(conf.slideFirst)
			? conf.slideFirst.call(slider)
			: conf.slideFirst || 0;

		// @@@ private fn: resolve_align @@@
		// this can be a number between -INF and +INF
		// or you can use "left", "center" or "right"
		function resolve_align (key, preset)
		{

			// get configured option
			var align = conf[key];

			// check if align matches any of our strings
			if (new RegExp(/^[lt]/i).test(align)) align = 0.0;
			if (new RegExp(/^[cm]/i).test(align)) align = 0.5;
			if (new RegExp(/^[rb]/i).test(align)) align = 1.0;

			// now check if it's valid or use given preset
			if (isNaN(parseInt(align, 10))) align = preset;
			// maybe there was no preset given, check again
			if (isNaN(parseInt(align, 10))) align = 0.5;

			// assign and return the number
			return conf[key] = align;

		}
		// EO @@@ private fn: resolve_align @@@

		// first resolve the shared value to inherit from
		var preset = resolve_align('align', 0.5);
		// then resolve the specific align options
		resolve_align('alignPanelDim', preset);
		resolve_align('alignPanelOpp', preset);
		resolve_align('alignViewport', preset);

		// fix the panel size from initial read
		var i = this.slides.length; while (i--)
		{

			// get jQuery object of this slide
			var slide = jQuery(this.slides[i]);

			// fix the size of the panel
			// TODO: make axis configurable
			if (conf.panelFixedAxis == 'dim')
			{ slide.width(slide.width()); }
			else if (conf.panelFixedAxis == 'opp')
			{ slide.height(slide.height()); }

		}
		// EO each slide

		// init array always
		// avoid checks in code
		slider.cloned = jQuery();

		// create cloned panels
		if (conf.carousel && slides.length)
		{

			// get variables (resolve afterwards)
			var cloneAfter = conf.cloneAfter,
			    cloneBefore = conf.cloneBefore,
			    clonePanels = conf.clonePanels,

			// Clone as many panels needed to fill the viewport.
			// If sizer is false you can use this config option
			// to adjust how many panels you want to have cloned
			// In this mode the viewport might be much wider than
			// all panels inside. Todo: Maybe support this better.
			clonePanels = clonePanels === true ? Math.ceil(conf.panelsVisible) :
			              clonePanels === false ? 0 : parseInt(clonePanels + 0.5);

			// distribute cloned panels after (right/bottom)
			cloneAfter = cloneAfter === true ? Math.ceil(clonePanels * (1 - conf.alignViewport)) :
			             cloneAfter === false ? 0 : isNaN(cloneAfter) ? 0 : cloneAfter;

			// distribute cloned panels before (left/top)
			cloneBefore = cloneBefore === true ? Math.ceil(clonePanels * (0 + conf.alignViewport)) :
			              cloneBefore === false ? 0 : isNaN(cloneBefore) ? 0 : cloneBefore;

			// accumulate all cloned panels
			// we may clone each slide more than once
			var after = jQuery([]), before = jQuery([]);

			// I will clone as many as you wish
			while (cloneBefore > slides.length)
			{
				// remove a full set of slides
				cloneBefore -= slides.length;
				// clone and add another full set
				jQuery.merge(before, slides.clone());
			}

			// clone panels before
			if (cloneBefore > 0)
			{
				// clone panels from end to extend the container
				before = jQuery.merge(slides.slice(- cloneBefore).clone(), before);
			}

			// I will clone as many as you wish
			while (cloneAfter > slides.length)
			{
				// remove a full set of slides
				cloneAfter -= slides.length;
				// clone and add another full set
				jQuery.merge(after, slides.clone());
			}

			// clone panels after
			if (cloneAfter > 0)
			{
				// clone panels from begining to extend the container
				jQuery.merge(after, slides.slice(0, cloneAfter).clone());
			}

			// append the cloned panels to the container and set class
			after.appendTo(slider.container).addClass('cloned');
			before.prependTo(slider.container).addClass('cloned');

			// increase min and max slide index
			slider.smax += after.length;
			slider.smax += before.length;
			slider.smin += before.length;

			// merge all cloned panels
			jQuery.merge(slider.cloned, before);
			jQuery.merge(slider.cloned, after)

			// store the cloned panels
			slider.before = before;
			slider.after = after;

		}
		// EO if conf.carousel

		// execute all init hooks
		slider.trigger('init');

		// lookup panels - equals slides if carousel == false
		slider.panels = container.find('>.' + klass.panel);

		// to which side should we float the panels / container
		// we normally always need to float the panels, also
		// for vertical stacking (just clear the float again)
		var floating = conf.offsetReverse ? 'right' : 'left';

		// for experimental carousel 3d module
		var overflow = conf.carousel3d ? 'visible' : 'hidden';

		// setup css for every panel
		var css = slider.conf.setFloat ?
			{ 'float' : floating } : {};

		// set some css to fix some issues
		// if you do not want this you have
		// to remove these styles on ready event
		slider.panels.css(css)
		// add viewport to collection
		.add(slider.viewport)
		// set on viewport and panels
		.css({ 'overflow' : overflow })
		// add container to collection
		.add(slider.container)
		// set on container, viewport and panels
		.css({ 'position' : 'relative', 'zoom' : 1 })

		// setup floats for the container
		if (!conf.vertical)
		{
			// get the tagname for panels
			var tag = slider.panels[0].tagName;
			// define html code for float clearer
			var clearer_div = jQuery('<DIV/>');
			var clearer_tag = jQuery('<' + tag + '/>');
			// define the css styles for the clearer tags
			var clearer_styles = { width: 0, height: 0, clear: 'both' };
			// we either float the container right or left
			slider.container.css('float', floating)
				// insert a float clearing div after the container
				.append(clearer_tag.css(clearer_styles))
				.after(clearer_div.css(clearer_styles));
		}

		// trigger loading hook
		slider.trigger('loading');

		// defer until all images are loaded
		// otherwise we will not get valid info
		// about resource dimensions like images
		jQuery('IMG', viewport)
			// wait loading images
			.imagesLoaded()
			// execute when ready
			.done(function()
			{

				// trigger ready hook
				slider.trigger('ready');

			});

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
				// get number of slides
				var count = this.slides.length;
				// protect from endless loop
				if (count <= 0) return 0;
				// adjust panels into the valid range
				while (panel > this.smax) panel -= count;
				while (panel < this.smin) panel += count;
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


		// @@@ method: update @@@
		prototype.update = function (option)
		{
			// extend our config with new options
			jQuery.extend(true, this.conf, option);
			// trigger position change event
			this.trigger('layout');
			// call global layout
			OCBNET.Layout(true);
		}
		// @@@ EO method: update @@@


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
			// else { throw('you tried to init rtp-slider twice') }
		});
	}
	/* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */


// END anonymous scope
})(jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Hook Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


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
			// EO if hook type exists

		}
		// EO each hook array

	}
	// @@@ EO method: trigger @@@


	// @@@ private fn: ordersort @@@
	function ordersort(a, b)
	{

		// sort numerical by order
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

	}, - 999999);
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// prepare ready state
		this.isReady = false;

	}, + 999999);
	// @@@ EO plugin: init @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// now set ready state
		this.isReady = true;

	}, - 999999);
	// @@@ EO plugin: ready @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// call start hook defered
		this.trigger('start');

	}, + 999999);
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

		// create the defered call via timeout with given delay
		this.defered[type] = OCBNET.Layout.defer(fn, delay);

	}
	// @@@ EO method: defer @@@


	// @@@ method: undefer @@@
	// reset waiting defered event
	prototype.undefer = function(type)
	{

		// clear the registered timeout
		OCBNET.Layout.undefer(this.defered[type]);

		// reset so we can register again
		this.defered[type] = false;

	}
	// @@@ EO method: undefer @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
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


	// @@@ plugin: ready @@@
	prototype.plugin('loading', function ()
	{

		// initialize slidepanels
		this.slidepanels = [];

		// get slides length
		this.slen = this.slides.length;

		// max index for real slider panels (not cloned ones)
		this.smax = this.smin + this.slen - 1;

		// process all panels to create slide index
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

	}, - 99999);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Panels Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


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

		// get the left/top and right/bottom value for this css box
		var lt = parseFloat(panel.css(prefix + css[0] + suffix), 10);
		var rb = parseFloat(panel.css(prefix + css[1] + suffix), 10);

		// some browser may return auto when the actual value is zero (ie8)
		if(isNaN(lt)) lt = 0; if(isNaN(rb)) rb = 0;

		// return an array with values and sum
		return [lt, rb, lt + rb];

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

		// return the accurate panel size
		// return this.conf.vertical ^ invert
		// 	? panel.get(0).clientHeight ? panel.get(0).clientHeight : panel.height()
		// 	: panel.get(0).clientWidth ? panel.get(0).clientWidth : panel.width();

	}
	// @@@ EO method: getPanelSize @@@


	// @@@ method: setPanelSize @@@
	prototype.setPanelSize = function (panel, value, invert)
	{

		// access panel only once (get id into range)
		panel = this.panels.eq(this.panel2panel(panel));

		// return the panel axis size
		return this.conf.vertical ^ invert
			? panel.height(value) : panel.width(value);

	}
	// @@@ EO method: setPanelSize @@@


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


	// @@@ method: updatePanelsDim @@@
	prototype.updatePanelsDim = function()
	{

		// get sizes for drag axis
		readPanelsSize.call(this, 0);

		// trigger hook for updated panels
		this.trigger('updatedPanelsDim');

	};
	// @@@ EO method: updatePanelsDim @@@


	// @@@ method: updatePanelsDim @@@
	prototype.updatePanelsOpp = function()
	{

		// get sizes for scroll axis
		readPanelsSize.call(this, 1);

		// trigger hook for updated panels
		this.trigger('updatedPanelsOpp');

	};
	// @@@ EO method: updatePanelsOpp @@@


	// @@@ plugin: updatedPanelsDim @@@
	// the pd (panel dimension) has been updated
	// recalculate the complete panel offset array
	prototype.plugin('updatedPanelsDim', function()
	{

		// experimental feature
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

		}
		// hardcore calculation by getting the real offsets
		// this should lead to perfect offset positions
		else
		{

			// get local variable
			var dimensions = this.pd[0];

			// get the vertical indicator for arrays
			var vertical = this.conf.vertical ? 1 : 0;

			// calculate offset for each panel
			var offset = 0; this.offset = [];

			// start with the first panel's offset
			var offset = this.panels.eq(0).offset();

			// get the start offset for the correct direction
			var start = vertical ? offset.top : offset.left;

			// adjust start offset for the margin
			start -= this.pm[vertical][0][0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				// get the offset value for this panel
				offset = this.panels.eq(i).offset();

				// get the offset for the correct direction
				offset = vertical ? offset.top : offset.left;

				// calculate the precise offset for this panel
				offset = parseFloat(offset) - start - this.pm[vertical][i][0];

				// sum up and store current offset
				this.offset.push(offset);

			}
			// EO foreach panel

			// have at least one panel
			if (this.panels.length)
			{

				// add last dimension to indicate the whole length
				this.offset.push(parseFloat(offset) + this.pd[0][i-1])

			}

		}

	}, + 99);
	// @@@ plugin: updatedPanelsDim @@@


	// @@@ plugin: loading @@@
	prototype.plugin('loading', function ()
	{

		// read styles for both axes
		readPanelsStyles.call(this, 0);
		readPanelsStyles.call(this, 1);

	}, - 99);
	// @@@ EO plugin: loading @@@

	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// read the dimensions
		// once before on ready
		this.updatePanelsDim();
		this.updatePanelsOpp();

	}, - 99);
	// @@@ EO plugin: ready @@@















	// @@@ method: readPanelsDim @@@
	prototype.readPanelsDim = function ()
	{

		// check if we are allowed to read from ua
		if (this.conf.sizerDim == 'panelsByViewport') eval('debugger');

		// get sizes for drag axis
		readPanelsSize.call(this, 0);

	}
	// @@@ EO method: readPanelsDim @@@

	// @@@ method: readPanelsOpp @@@
	prototype.readPanelsOpp = function ()
	{

		// check if we are allowed to read from ua
		if (this.conf.sizerOpp == 'panelsByViewport') eval('debugger');

		// get sizes for scroll axis
		readPanelsSize.call(this, 1);

	}
	// @@@ EO method: readPanelsOpp @@@

	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// read viewport so we can use it to layout panels
		if (this.conf.sizerDim == 'viewportByPanels') this.readPanelsDim();
		if (this.conf.sizerOpp == 'viewportByPanels') this.readPanelsOpp();

	}, -9999);
	// @@@ EO plugin: changedViewport @@@

	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// read viewport opp after adjustment
		if (this.conf.sizerDim == 'none') this.readPanelsDim();
		if (this.conf.sizerOpp == 'none') this.readPanelsOpp();

	}, 9999);
	// @@@ EO plugin: changedViewport @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Viewport Functions
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

		// add defaults
		extend({

			// link wrapper dimension to viewport
			linkWrapperToViewportDim: true,
			// link wrapper opposition to viewport
			linkWrapperToViewportOpp: false

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// closure object
		var slider = this;

		// create closure function
		function changedViewport (evt, widget)
		{
			// trigger adjust viewport hook
			// integrates ocbnet layout manager
			slider.trigger('adjustViewport');
			// do not propagate any further
			// we may emit another event if needed
			evt.stopPropagation();
		}

		// event is emmited on wrapper, not on viewport
		// otherwise we would handle our own event again
		slider.viewport.bind('changedViewport', changedViewport)

	});
	// @@@ EO plugin: init @@@


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

	// @@@ method: updateViewportDim @@@
	prototype.updateViewportDim = function (value)
	{

		// development assertion
		if (isNaN(value)) eval('debugger');

		// check if we are allowed to read from ua
		// this should not happen, remove when use case emerges
		if (this.conf.sizerDim != 'viewportByPanels') eval('debugger');

		// does the value really change
		if (this.vp_x == value) return;

		// assign given viewport dimension
		setViewportSize.call(this, value, 0);

		// remember old value to pass to hook
		var before = this.vp_x; this.vp_x = value;

		// now trigger the updatedViewportDim hook
		this.trigger('updatedViewportDim', value, before);

		// issue an event for any outside listeners
		this.wrapper.trigger('changedViewport', this);

	}
	// @@@ EO method: updateViewportDim @@@

	// @@@ method: updateViewportOpp @@@
	prototype.updateViewportOpp = function (value)
	{

		// development assertion
		if (isNaN(value)) eval('debugger');

		// check if we are allowed to read from ua
		// this should not happen, remove when use case emerges
		if (this.conf.sizerOpp != 'viewportByPanels') eval('debugger');

		// does the value really change
		if (this.vp_y == value) return;

		// assign given viewport dimension
		setViewportSize.call(this, value, 1);

		// remember old value to pass to hook
		var before = this.vp_y; this.vp_y = value;

		// now trigger the updatedViewportOpp hook
		this.trigger('updatedViewportOpp', value, before);

		// issue an event for any outside listeners
		this.wrapper.trigger('changedViewport', this);

	}
	// @@@ EO method: updateViewportOpp @@@


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
	{ return getViewportSize.call(this, 0); }
	// @@@ EO method: getViewportDim @@@

	// @@@ method: getViewportOpp @@@
	prototype.getViewportOpp = function ()
	{ return getViewportSize.call(this, 1); }
	// @@@ EO method: getViewportOpp @@@

	// @@@ method: readViewportDim @@@
	prototype.readViewportDim = function ()
	{

		// check if we are allowed to read from ua
		if (this.conf.sizerDim == 'viewportByPanels') eval('debugger');

		// store the current viewport dimension
		this.vp_x = getViewportSize.call(this, 0);

	}
	// @@@ EO method: readViewportDim @@@

	// @@@ method: readViewportOpp @@@
	prototype.readViewportOpp = function ()
	{

		// check if we are allowed to read from ua
		if (this.conf.sizerOpp == 'viewportByPanels') eval('debugger');

		// store the current viewport opposition
		this.vp_y = getViewportSize.call(this, 1);

	}
	// @@@ EO method: readViewportOpp @@@

	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// read viewport so we can use it to layout panels
		if (this.conf.sizerDim == 'panelsByViewport') this.readViewportDim();
		if (this.conf.sizerOpp == 'panelsByViewport') this.readViewportOpp();

	}, -9999);
	// @@@ EO plugin: changedViewport @@@

	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// read viewport after everything else is done
		if (this.conf.sizerDim == 'none') this.readViewportDim();
		if (this.conf.sizerOpp == 'none') this.readViewportOpp();

	}, 9999);
	// @@@ EO plugin: changedViewport @@@


	// @@@ plugin: updatedPanelsOpp @@@
	prototype.plugin('updatedPanelsOpp', function ()
	{

		// read viewport after panels have changed
		if (this.conf.sizerOpp == 'none') this.readViewportOpp();

	})
	// @@@ EO plugin: updatedPanelsOpp @@@


	// @@@ plugin: updatedPanelsDim @@@
	prototype.plugin('updatedPanelsDim', function ()
	{

		// read viewport after panels have changed
		if (this.conf.sizerDim == 'none') this.readViewportDim();

	})
	// @@@ EO plugin: updatedPanelsDim @@@

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Container Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


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

		/*

		Tests have shown that the clamping is not needed here!
		So this has been disabled on purpose for performance!
		Keep the code anyway, as it might become needed again!

		// get the left and right position
		// also calculate size of all slides
		var conf = this.conf
		    align = conf.align * conf.vp_x,
		    left = this.offset[this.smin] + align,
		    right = this.offset[this.smax + 1] + align,
		    size = right - left;

		// shift into range when in carousel
		// protect from endless loop condition
		if (conf.carousel && size > 0)
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

		*/

		// only set offset to full integers
		// avoids some strange visual bugs
		offset = parseInt(offset + 0.5);

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


	// @@@ plugin: updatedPanelsDim @@@
	prototype.plugin('updatedPanelsDim', function ()
	{

		// in vertical mode the container always
		// has the panels correctly layed out
		if (this.conf.carousel3d) return;
		if (this.conf.vertical) return;

		// sum up the dimensions for the container
		// calculate it so we can later get the accurate
		// pixel offset for the positioning from the ua
		// the panels hook for updatedPanelsDim runs later
		var dim = 0, i = this.panels.length;
		while (i--) { dim += this.pd[0][i]; }

		// set the container width/height to the calculated value to contain all panels
		// there is no getter or setter method for this particular container attribute
		// we really only need to adjust this dimension if the panel dimensions have changed
		this.container.css(getSizeCssStr.call(this), Math.ceil(dim) + 'px')

	}, - 9999);
	// @@@ EO plugin: updatedPanelsDim @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// check container offset
		this.checkContainerOffset();

	}, - 99);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Visibility Core Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: updatePanelExposure @@@
	function updatePanelExposure()
	{

		// get values from the current internal status
		var position = this.slide2panel(this.position),
		    visible = this.conf.panelsVisible || 1;

		// declare local variables
		var conf = this.conf,
		    alignPanelDim = conf.alignPanelDim,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanelDim,
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
		position += alignPanelDim - alignViewport * panelsVisible;

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
		var se = this.se; this.se = exposure;

		// execute the changedExposure hook for slides
		this.trigger('changedExposure', exposure, se);


	}
	// @@@ EO private fn: updatePanelExposure @@@


	// @@@ fn: updateSlideVisibility @@@
	function updateSlideVisibility ()
	{

		// protect beeing called too early
		if (this.isReady !== true) return;

		// get values from the current internal status
		var panel = this.ct_off;

		// development assertion
		if (isNaN(this.vp_x))
		{ eval('debugger'); }
		// development assertion
		if (isNaN(this.ct_off))
		{ eval('debugger'); }

		// declare local variables
		var visible,
		    panel_left = 0,
		    visibility = [],
		    smin = this.smin,
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
			var panel_right = panel_left + widths[slide + smin];

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
		var sv = this.sv; this.sv = visibility;

		// execute the changedVisibility hook for slides
		this.trigger('changedVisibility', visibility, sv);

	}
	// @@@ EO fn: updateSlideVisibility @@@


	// calculate the exposure array very early
	prototype.plugin('layout', updatePanelExposure, -99);
	prototype.plugin('loading', updatePanelExposure, -99);
	prototype.plugin('changedPosition', updatePanelExposure, -99);

	// calculate the visibility array very late
	prototype.plugin('layout', updateSlideVisibility, 99);
	prototype.plugin('changedPosition', updateSlideVisibility, 99);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Position Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ method: setPosition @@@
	prototype.setPosition = function (position)
	{

		// normalize the slide index
		position = this.slide2slide(position);

		// check if the position really changed
		if (this.position == position) return;

		// get previous position to pass
		var previous = this.position;

		// store normalized position
		this.position = position;

		// sync to monitor?
		if (this.conf.vsync)
		{
			// synchronize action with monitor
			this.trigger('changedPosition', previous);
		}
		else
		{
			// defer draw to achieve the wished frame rate (approx)
			this.defer(1000 / this.conf.fps, 'changedPosition', previous);

		}

	}
	// @@@ EO method: setPosition @@@


	// @@@ plugin: layout @@@
	prototype.plugin('changedPosition', function ()
	{

		// just reset the current position
		this.setOffsetByPosition(this.position);

	});
	// @@@ EO plugin: layout @@@


	// @@@ method: setOffsetByPosition @@@
	prototype.setOffsetByPosition = function (position)
	{

		// protect beeing called too early
		if (this.isReady !== true) return;

		// store current normalized position
		this.position = this.slide2slide(position);

		// declare local variables
		var conf = this.conf,
		    alignPanelDim = conf.alignPanelDim,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanelDim,
				    fill_right = -1 * fill_left + panelsVisible - 1;

				// adjust panel position to make those
				// panels "virtually" visible / exposed
				if (position < this.smin + fill_left)
				{ position = this.smin + fill_left; }
				if (position > this.smax - fill_right)
				{ position = this.smax - fill_right; }

			}
			// EO if conf.fillViewport

		}
		// EO if not conf.carousel

		// maybe do not update the actual container offset
		if (this.animation && this.animation.fader) return;

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
		index += this.smin + this.conf.alignPanelDim;

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
		    align = this.conf.alignPanelDim + this.smin;


		if (this.conf.carousel && right > left)
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
				return (px - panel_left) / (panel_right - panel_left) + i - align;

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

	}, + 999);
	// @@@ EO plugin: layout @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
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
			easeFunction: 'linear'

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
			step: function () { step.call(slider, this, arguments); },
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

		this.animation = animation;

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

		// handle special fader animation
		if (animation.action.toString().match(/^f(\d+)/i))
		{
			animation.action = RegExp.$1;
			animation.fader = this.conf.tiles && this.conf.fader;
		}

		// get the absolute position for this action
		var pos = actionToPosition.call(this, animation.action);

		// register resume function for lockers
		// the lock method will take care to attach
		// this function to the right context object
		this.resume = function ()
		{

			// now trigger the startAnimation hook
			this.trigger('startAnimation');

			// start dequeuing next action
			// preAnimation hook has completed
			dequeue.call(this, animation);

			if (animation.fader)
			{

				this.position = this.slide2panel(animation.action - 1);

				this.trigger('changedPosition', -1);

				jQuery('.rtp-slider-fader', this.el)
				.css({
					'opacity' : '1',
					'display' : 'block'
				})
			}

			// reset our resumer
			this.resume = null;

		}
		// EO fn resume

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

		if (this.animation && this.animation.fader)
		{
			this.animation.fader = false;
			this.trigger('changedPosition');
		}

		this.animation = {};

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

		// if (animation.fader) {}
		var fader = jQuery('.rtp-slider-fader', this.el);
		fader.css('display', 'none').css('opacity', '');

		// just reset the current position
		this.setOffsetByPosition(this.position);

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
	var step = function (cur, animation)
	{

		var foo = this.animation;

		// move slider to position
		this.setPosition(cur.pos);

		if (foo.fader)
		{

			var end = animation[1].end,
			    start = animation[1].start;

			if (end == start) return;

			var progress = (cur.pos - start) / (end - start);

			var fader = jQuery('.rtp-slider-fader', this.el);

			fader.show().find('.tile').css('opacity', progress);

		}


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
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Sizer Functions
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

		// add defaults
		extend({

			// which viewport dimension should be fluid
			// those values are read from the user agent
			// and the code must not try to set that itself
			// valid: panelsByViewport or viewportByPanels
			sizerDim: 'panelsByViewport',
			sizerOpp: 'viewportByPanels'

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ method: preLayout @@@
	// called by OCBNET.Layout library
	prototype.preLayout = function(data)
	{

		// read viewport dimensions first
		// use only these values to adjust ui
		if (this.conf.sizerDim != 'viewportByPanels') this.trigger('readViewportDim', data);
		if (this.conf.sizerOpp != 'viewportByPanels') this.trigger('readViewportOpp', data);

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		// if (
		// 	Math.abs(this.vp_x_lck - this.vp_x) > 0.0001 ||
		// 	Math.abs(this.vp_y_lck - this.vp_y) > 0.0001 ||
		// 	data.force
		// )
		// {
		// }
		// EO if dimension changed

		// update and adjust all ui elements
		this.trigger('changedViewport', data);

	}
	// @@@ EO method: preLayout @@@


	// @@@ method: postLayout @@@
	// called by OCBNET.Layout library
	prototype.postLayout = function(data)
	{

		if (
			Math.abs(this.vp_x_lck - this.vp_x) > 0.0001 ||
			Math.abs(this.vp_y_lck - this.vp_y) > 0.0001 ||
			data.force
		)
		{

			// adjust outer ui elements (viewport)
			this.trigger('adjustViewport', data);

		}

	}
	// @@@ EO method: postLayout @@@

	// @@@ method: updateLayout @@@
	// called by OCBNET.Layout library
	prototype.updateLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			this.vp_x_lck != this.vp_x ||
			this.vp_y_lck != this.vp_y ||
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
	// @@@ EO method: updateLayout @@@


	// @@@ plugin: ready @@@
	prototype.plugin('start', function()
	{

		// add widget to layout manager
		OCBNET.Layout.add(this);

		// trigger changed viewport once
		this.trigger('changedViewport');

		// layout user interface
		OCBNET.Layout(true);

	}, 999999);
	// @@@ EO plugin: ready @@@


	// @@@ plugin: changedPosition @@@
	// A position change may change the opposition
	// which could trigger a scrollbar, so check for
	// this condition here on the corresponding event
	prototype.plugin('changedPosition', function()
	{

		// current viewport dimensions
		var vp_x = this.getViewportDim();
		var vp_y = this.getViewportOpp();

		// check against the stored viewport dimensions for changes
		// if they differ, chances are we need to update all layouts
		if (vp_x != this.vp_x || vp_y != this.vp_y) OCBNET.Layout(true);

	}, 999999);
	// @@@ EO plugin: changedPosition @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Align the panels to the opposite direction of the viewport. Just usefull if the
  viewport has a fixed height and no fluid panels. So you may want to align the
  panels vertically to the bottom or to the middle (like css vertical-align).

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

			// center in viewport
			alignPanelOpp: 0.5

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ private fn: alignOppInViewport @@@
	function alignOppInViewport ()
	{

		// get the css attribute to set
		var css = this.conf.vertical ? 'left' : 'top',
		    // get the alignment number (between 0 and 1)
		    align = parseFloat(this.conf.alignPanelOpp, 10);

		// check for valid number
		if (isNaN(align)) return;

		// loop all slides to set their offset
		var i = this.panels.length; while (i--)
		{

			// calculate the difference and multiply to align
			var offset = (this.vp_y - this.pd[1][i]) * align;

			// set this panel offset for given direction
			jQuery(this.panels[i]).css(css, offset + 'px');

		}
		// EO each panel

	}
	// @@@ EO private fn: alignOppInViewport @@@


	// run late after the viewport opposition has been changed/updated
	prototype.plugin('adjustViewport', alignOppInViewport, 99999);
	prototype.plugin('changedPosition', alignOppInViewport, 99999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visible panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport opposition changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerDim == 'panelsByViewport')
		{
			// process all slides to set dimension
			var i = this.slides.length; while (i--)
			{
				// set size to the calculated value
				this.setSlideDim(i, this.getSlideDimFromVp(i));
			}
		}

	})
	// @@@ EO plugin: changedViewport @@@


	// @@@ plugin: adjustViewport @@@
	prototype.plugin('adjustViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerDim == 'panelsByViewport')
		{
			// trigger the changed panels dim hook
			this.trigger('updatedPanelsDim');
			// now update the panel opposition
			// read in the new dimensions and
			// dispatch updatedPanelsOpp event
			this.updatePanelsOpp();
		}

	});
	// @@@ EO plugin: adjustViewport @@@


	// @@@ method: getSlideDimFromVp @@@
	// get the dimension for the given slide
	prototype.getSlideDimFromVp = function (slide)
	{

		// correct virtual viewport to get rid of the margin
		var virtual = this.vp_x + (this.conf.margin || 0);

		// we currently distribute everything evenly to all slides
		// todo: implement a more complex sizer with distribution factors
		return parseFloat(virtual / this.conf.panelsVisible, 10)

	}
	// @@@ EO method: getSlideDimFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Adjust the panels opposition to the available viewport opposition.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerOpp == 'panelsByViewport')
		{

			// process all slides to set opposition
			var i = this.slides.length; while (i--)
			{

				// set size to full viewport opp
				this.setSlideOpp(i, this.getSlideOppFromVp(i));

			}
		}

	});
	// @@@ EO plugin: changedViewport @@@


	// @@@ plugin: adjustViewport @@@
	prototype.plugin('adjustViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerOpp == 'panelsByViewport')
		{
			// trigger the changed panels dim hook
			this.trigger('updatedPanelsOpp');
			// now update the panel opposition
			// read in the new dimensions and
			// dispatch updatedPanelsOpp event
			this.updatePanelsDim();
		}

	});
	// @@@ EO plugin: adjustViewport @@@


	// @@@ method: getSlideOppFromVp @@@
	// get the opposition for the given slide
	prototype.getSlideOppFromVp = function (slide)
	{

		// extend to the full opposition
		// todo: implement a more complex method
		return parseFloat(this.vp_y, 10)

	}
	// @@@ EO method: getSlideOppFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Adjust the viewport dimension to the currently shown panel(s).

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: viewportDimByPanels @@@
	function viewportDimByPanels ()
	{

		// protect beeing called too early
		if (this.isReady !== true) return;

		// abort if feature is not enabled
		if (this.conf.sizerDim != 'viewportByPanels') return;

		// calculate dimension from exposure
		var dim = 0, exposure = this.se;

		// development assertions
		if (exposure.length == 0) eval('debugger');
		if (this.pd[0].length == 0) eval('debugger');

		// process all panel visibilites
		for(var i = 0; i < exposure.length; i++)
		{

			// skip if panel is not visible
			if (exposure[i] == 0) continue;

			// sum up dimensions of all panels
			dim += this.pd[0][i] * exposure[i];

		}

		// set viewport dimension
		this.updateViewportDim(dim);

	}
	// @@@ EO private fn: viewportDimByPanels @@@


	// hook into various change events to adjust viewport
	prototype.plugin('adjustViewport', viewportDimByPanels, 9999);
	prototype.plugin('changedPosition', viewportDimByPanels, 9999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);;
/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Adjust the viewport opposition to the currently shown panel(s).

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

			// when is a panel not visible
			autoVpOppDeadZone: 0.2,
			// when is a panel fully visible
			autoVpOppLifeZone: 0.8

		});

	});
	// @@@ EO plugin: config @@@



	// @@@ private fn: viewportOppByPanels @@@
	function viewportOppByPanels ()
	{

		// protect beeing called too early
		if (this.isReady !== true) return;

		// abort if feature is not enabled
		if (this.conf.sizerOpp != 'viewportByPanels') return;

		// declare local variables for loop
		var min = 1E+100, opps = [], exposure = this.se,
		    // dead zone for out of view panel
		    dead_zone = parseFloat(this.conf.autoVpOppDeadZone, 10),
		    // life zone for out of view panel
		    life_zone = parseFloat(this.conf.autoVpOppLifeZone, 10);

		// assertion for numeric value
		if (isNaN(dead_zone)) dead_zone = 0.2;
		if (isNaN(life_zone)) life_zone = 0.8;

		// switch arguments if they seem to be
		// defined in the opposite way (play safe)
		if (dead_zone > life_zone)
		{
			var foobar = dead_zone;
			dead_zone = life_zone;
			life_zone = foobar;
		}

		// development assertions
		if (exposure.length == 0) eval('debugger');
		if (this.pd[1].length == 0) eval('debugger');

		// process all panel visibilites
		var i = exposure.length; while (i --)
		{
			// check if current panel is visible and smaller than min
			if (exposure[i] > 0 && this.pd[1][i] < min) min = this.pd[1][i];
		}

		// process all panel visibilites
		var i = exposure.length; while (i --)
		{

			// skip if panel is not visible
			if (exposure[i] === 0) continue;

			// check if panel is fully visible
			if (exposure[i] > life_zone)
			{

				// use full panel size difference
				opps.push((this.pd[1][i] - min));

			}

			// panel only partial visible
			else if (exposure[i] > dead_zone)
			{

				// use a partial panel size diff (distribute from 0 to 1 between dead_zone and life_zone)
				opps.push((this.pd[1][i] - min) * (exposure[i] - dead_zone) / (life_zone - dead_zone));

			}

		}
		// EO foreach panel visiblity

		// get the biggest value from array
		var offset = Math.max.apply(Math, opps);

		// update opposite viewport size
		// take minimum size and add offset
		this.updateViewportOpp(min + offset);

	}
	// @@@ EO private fn: viewportOppByPanels @@@


	// hook into various change events to adjust viewport
	prototype.plugin('adjustViewport', viewportOppByPanels, 9999);
	prototype.plugin('changedPosition', viewportOppByPanels, 9999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);