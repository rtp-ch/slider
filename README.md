RTP Slider
=====================

Extremly versatile and flexible slider. Strong support for fluid / responsive Designs, mobile browsers
and touch devices. Has nearly every feature that you can find in other sliders on the web.


### Dependencies

RTP Slider is dependent on following libraries:

- jQuery (1.7 or higher)
- jquery.easing plugin (1.3 or higher)
- jquery.imagesloaded plugin (2.1 or higher)

It's recommended that you download the latest versions of the libraries yourself:

- http://www.jquery.com/
- http://gsgd.co.uk/sandbox/jquery/easing/
- http://desandro.github.com/imagesloaded/

You may also use a CDN (Content Delivery Network) to load the libraries directly from:

<pre>
&lt;script src=&quot;//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;//cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;//cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/2.1.0/jquery.imagesloaded.min.js&quot;&gt;&lt;/script&gt;
</pre>

### Basic usage

<pre>

  // initialize and get slider instance
  var slider = jQuery('DIV.rtp-slider')
  // initialize the slider
  .rtpSlider({

    config : value,
    ... : ...

  })
  // get instance from data
  .data('rtpSlider');

</pre>

### Playground

You may use the demo example to play around with various config options. It's not yet 100% finished,
but should give you a good overview of what this slider is capable of:

- http://rawgithub.com/mgreter/slider/master/examples/demo/demo.html


### Configuration

The configuration can be overwritten by data attributes on the slider element (ie. data-carousel="0").

<pre>sizerDim: option (default: false)</pre>

How should the slider dimension be layouted / sized (width for horizontal and height for vertical).
Valid options are 'panelsByViewport' or 'viewportByPanels'. We will either adjust the panels to a
fluid viewport or set the viewport to the size of the actual panel.

<pre>sizerOpp: option (default: false)</pre>

How should the slider opposition be layouted / sized (height for horizontal and width for vertical).
Valid options are 'panelsByViewport' or 'viewportByPanels'. We will either adjust the panels to a
fluid viewport or set the viewport to the size of the actual panel.

<pre>setFloat: bool (default: true)</pre>

Set panels to float if vertical is not enabled.

<pre>vertical: bool (default: false)</pre>

Enable vertical sliding. Default is horizontal.

<pre>shrinkViewport: bool (default: false)</pre>

Shrink the viewport on the current layout. Option is seldomly usefull and only
available if there is no sizer set.

<pre>fillViewport: bool (default: false)</pre>

Try to avoid any empty spots in the viewport if possible. Option is seldomly
usefull and only available if there is no sizer set.

<pre>carousel: bool (default: false)</pre>

Enable the carousel or endless swipe mode.

<pre>panelsVisible: float (default: 1)</pre>

How many panels should be visible at once.

<pre>clonePanels: integer (default: false)</pre>

Force number of cloned panels. Will be distributed acording to alignViewport option.

<pre>cloneBefore: integer (default: false)</pre>

Force number of cloned panels at the begining of the container.

<pre>cloneAfter: integer (default: false)</pre>

Force number of cloned panels at the end of the container.

<pre>align: float (default: 0.5)</pre>

This is a shared value for both align options (alignPanel and alignViewport). It does not
do anything on it's own, but normally you want both align options to be the same. You may
also use 'left', 'center' or 'right' (only the first letter is important).

<pre>alignPanelDim: float (default: 0.5)</pre>

Offset the panel to align it to the viewport dimension. If you align it to the right (1), the
right side of the panel will be shown at the viewport position.

<pre>alignPanelOpp: float (default: 0.5)</pre>

Offset the panel to align it to the viewport opposition. If you align it to the bottom (1), the
bottom side of the panel will be shown at the viewport position.

<pre>alignViewport: float (default: 0.5)</pre>

Offset the shown position into the viewport. Align it to left (0), center (0.5) or right (1).
Use alignPanel to offset the panel itself to align the active slide as you want.

<pre>autoVpOppDeadZone: float (default: 0.5)</pre>

How far has the panel to be into view until adjusting the viewport to the full opposite dimension.

<pre>autoslide: bool (default: false)</pre>

Start the autoslider after slider has been initialized.

<pre>autoslideAction: action (default: +1)</pre>

The action to execute on each autoslide.

<pre>autoslidePauseOnHover: bool (default: false)</pre>

Pause the autoslider when the mouse hovers over the viewport. Will be restarted after the mouse
moves out of the viewport again (see autoslideResumeDelay).

<pre>autoslideStopOnHover: bool (default: false)</pre>

Stop the autoslider when the mouse hovers over the viewport.

<pre>autoslideStopOnAction: bool (default: false)</pre>

Stop the autoslider when the user executes an action like clicking on a navigation item.

<pre>autoslideDelay: integer (default: 3500)</pre>

Default delay between slide steps.

<pre>autoslideFirstDelay: integer (default: 1000)</pre>

Delay after initialization or any other autoslide resume/start call.

<pre>autoslideResumeDelay: integer (default: false)</pre>

Special delay when the autoslider is resumed from the paused state.

<pre>progressBar: bool (default: false)</pre>

Show a progress bar while waiting for the next (auto) slide.

<pre>progressBarPosition: string (default: 'append')</pre>

Where should we put the progress bar dom node. Valid options are 'append', 'prepend' or 'both'.

<pre>curClass: string (default: 'current')</pre>

Mark the currently active panel with this class.

<pre>curClassDeadZone: float (default: 0.25)</pre>

How much has the active panel to be visible until setting the current class.

<pre>easeDuration: integer (default: 1200)</pre>

The duration of one slide step.

<pre>easeFunction: string (default: 'easeInOutExpo')</pre>

Easing function for the slide step.

<pre>slideFirst: float (default: 0)</pre>

The first slide to load on initialization. Can also be a function which should return the value.

<pre>fps: integer (default: 25)</pre>

Try to acheive that many frames per second when doing animations. This is mainly used when resizing
or updating the layout otherwise, which will also happen when doing swipes and other actions.

<pre>vsync: bool (default: false)</pre>

Do layout and other updates as soon as we receive the corresponding events.

<pre>gestureSwipe: bool (default: false)</pre>

Enable the gesture library for swiping.

<pre>mouseSwipe: bool (default: false) (deprecated/broken)</pre>

Enable the mouse for swiping.

<pre>touchSwipe: bool (default: false) (deprecated/broken)</pre>

Enable touch devices for swiping.

<pre>swipeThreshold: integer (default: 5)</pre>

Minimum amount of pixels before we decide in which direction the swipe is going. This
is done to still be able to scroll the page via touch events.

<pre>linkWrapperToViewportDim: bool (default: true)</pre>

Link the dimension of the outer wrapper to the dimension of the viewport.

<pre>linkWrapperToViewportOpp: bool (default: false)</pre>

Link the opposite dimension of the outer wrapper to the opposite dimension of the viewport.

<pre>navArrows: bool (default: false)</pre>

Enable the navigation arrows widget.

<pre>navArrowAttach: option (default: 'wrapper')</pre>

Where to attach the navigation arrows. Valid options are 'wrapper' or 'panels'.

<pre>navArrowNextText: string (default: 'right &#187;')</pre>

Set the text or html for the next nav arrow.

<pre>navArrowPrevText: string (default: '&#171; left')</pre>

Set the text or html for the previous nav arrow.

<pre>navArrowPosition: option (default: 'default')</pre>

Where to attach the nav arrows. By default we prepend the prev arrow and append the nav arrow.
Other options are to 'prepend' or to 'append' both arrows. Or 'reverse' the default position.

<pre>navDots: bool (default: false)</pre>

Enable the navigation dots widget.

<pre>navDotAltFormat: function (slide)</pre>

Return the alt text for the nav dot image.

<pre>navDotTitleFormat: function (slide)</pre>

Return the title text for the nav dot image.

<pre>navDotStepFunction: function (slide, progress)</pre>

Function is called to update the nav dots when visibility is changing.
By default we adjust the opacity of the image.

<pre>navKeyboard: bool (default: false)</pre>

Enable the keyboard navigation plugin.

<pre>navKeyboardPrev: keycode (default: [37/38])</pre>

The charcode to trigger the prev action (use 'up' key if vertical mode is enabled).

<pre>navKeyboardNext: keycode (default: [39/40])</pre>

The charcode to trigger the next action (use 'down' key if vertical mode is enabled).

<pre>navToolbar: bool (default: false)</pre>

Enable the navigation toolbar (mainly for autoslider).

<pre>navToolbarButtons (default: 'rewind, toggle-stop, toggle-pause, forward')</pre>

Buttons available on the toolbar in that order. If carousel is not enabled we will
add first and last button to the default configuration.

### Compile slider sources

We use [webmerge](https://github.com/mgreter/webmerge) to create the release
files. Once it is installed, you simply need to execute the compiler scripts.

### Licence

This is free software; you can redistribute it and/or modify it under the terms
of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
either version 3 of the License, or (at your option) any later version.

### Github Page with demo

 - http://rtp-ch.github.com/slider/

### Examples

 - http://rawgithub.com/mgreter/slider/master/examples/swipe.html
 - http://rawgithub.com/mgreter/slider/master/examples/addons.html
 - http://rawgithub.com/mgreter/slider/master/examples/nested.html
 - http://rawgithub.com/mgreter/slider/master/examples/adaptive.html
 - http://rawgithub.com/mgreter/slider/master/examples/tiles.html (alpha)
 - http://rawgithub.com/mgreter/slider/master/examples/carousel3d.html (alpha)
 - http://rawgithub.com/mgreter/slider/master/examples/demo/demo.html (experimental)

Use the mouse or touch device to swipe through the panels!

### Core developer docs

I wrote a small script to parse the code and generate some api docs. This is
at a very early stage, but may be of some interest to some people. It's not really
about documenting the API. More to get an overview over the code, the event handlers
and method invocation.

  - http://rawgithub.com/mgreter/slider/master/doc/jsdoc/jsdoc.html