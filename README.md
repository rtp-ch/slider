RTP Slider
=====================

Extremly versatile and flexible slider. Strong support for fluid / responsive Designs, mobile browsers
and touch devices. Has nearly every feature that you can find in other sliders on the web.

### Dependencies

RTP Slider is dependent on following libraries:

- jQuery
- jquery.easing plugin
- jquery.imagesloaded plugin

The libraries can be found in the dependencies folder.



### Configuration

<pre>sizer: option (default: false)</pre>

How should the slider be layouted / sized. Valid options are 'panelsByViewport' or
'viewportByPanels'. We will either adjust the panels to a fluid viewport or set the
viewport to the size of the actual panel.

<pre>setFloat: bool (default: true)</pre>

Set panels to float if vertical is not enabled.

Enable vertical sliding. Default is horizontal.

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

<pre>align: float (default: 0.5)</pre>

This is a shared value for both align options (alignPanel and alignViewport). It does not
do anything on it's own, but normally you want both align options to be the same. You may
also use 'left', 'center' or 'right' (only the first letter is important).

<pre>alignPanel: float (default: 0.5)</pre>

Offset the panel to align it to the viewport position. If you align it to the right (1), the
right side of the panel will be shown at the viewport position.

<pre>alignViewport: float (default: 0.5)</pre>

Offset the shown position into the viewport. Align it to left (0), center (0.5) or right (1).
Use alignPanel to offset the panel itself to align the active slide as you want.

<pre>autoVpOpp (default: true)</pre>

Automatically adjust the opposite dimension of the viewport to match the current shown panel.

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

<pre>curClass: string (default: 'current')</pre>

Mark the currently active panel with this class.

<pre>curClassDeadZone: float (default: 0.25)</pre>

How much has the active panel to be visible until setting the current class.

<pre>easeDuration: integer (default: 1200)</pre>

The duration of one slide step.

<pre>easeFunction: string (default: 'easeInOutExpo')</pre>

Easing function for the slide step.

<pre>firstSlideToLoad: float (default: 0)</pre>

The first slide to load on initialization. Can also be a function which should return the value.

<pre>fps: integer (default: 25)</pre>

Try to acheive that many frames per second when doing animations. This is mainly used when resizing
or updating the layout otherwise, which will also happen when doing swipes and other actions.

<pre>vsync: bool (default: false)</pre>

Do layout and other updates as soon as we receive the corresponding events.

<pre>swipe: bool (default: false)</pre>

Enable the swipe functionality.

<pre>mouseSwipe: bool (default: false)</pre>

Enable the mouse for swiping.

<pre>touchSwipe: bool (default: false)</pre>

Enable touch devices for swiping.

<pre>swipeVsync: bool (default: false)</pre>

Update the user interface as soon as the swipe event is triggered. If disabled we will
defer the updates and try to achieve as many frames per second as defined in swipeFps.

<pre>swipeThreshold: integer (default: 5)</pre>

Minimum amount of pixels before the swipe events are triggered.

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

### Licence

This is free software; you can redistribute it and/or modify it under the terms
of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
either version 3 of the License, or (at your option) any later version.

### Github Page with demo

 - http://rtp-ch.github.com/slider/
