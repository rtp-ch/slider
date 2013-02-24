SRC_DIR = ./src/

all: merge minify

merge:
	cat \
		${SRC_DIR}header.js \
		${SRC_DIR}ocbnet/layout.js \
		${SRC_DIR}rtp/common/multievent.js \
		${SRC_DIR}rtp/slider.js \
		${SRC_DIR}rtp/slider/core/hooks.js \
		${SRC_DIR}rtp/slider/core/slides.js \
		${SRC_DIR}rtp/slider/core/panels.js \
		${SRC_DIR}rtp/slider/core/viewport.js \
		${SRC_DIR}rtp/slider/core/container.js \
		${SRC_DIR}rtp/slider/core/visibility.js \
		${SRC_DIR}rtp/slider/core/position.js \
		${SRC_DIR}rtp/slider/core/animation.js \
		${SRC_DIR}rtp/slider/sizer.js \
		${SRC_DIR}rtp/slider/sizer/alignOppInViewport.js \
		${SRC_DIR}rtp/slider/sizer/panelsDimByViewport.js \
		${SRC_DIR}rtp/slider/sizer/panelsOppByViewport.js \
		${SRC_DIR}rtp/slider/sizer/viewportDimByPanels.js \
		${SRC_DIR}rtp/slider/sizer/viewportOppByPanels.js \
		${SRC_DIR}rtp/slider/addons/nav-dots.js \
		${SRC_DIR}rtp/slider/addons/nav-arrows.js \
		${SRC_DIR}rtp/slider/addons/nav-keyboard.js \
		${SRC_DIR}rtp/slider/addons/classes.js \
		${SRC_DIR}rtp/slider/addons/autoslide.js \
		${SRC_DIR}rtp/slider/addons/panel-infobox.js \
		${SRC_DIR}ocbnet/slider/swipe.js \
		${SRC_DIR}ocbnet/slider/swipe/mouse.js \
		${SRC_DIR}ocbnet/slider/swipe/touch.js \
		${SRC_DIR}ocbnet/slider/addons/toolbar.js \
		${SRC_DIR}ocbnet/slider/addons/progressbar.js \
		${SRC_DIR}lib/csshooks.js \
		${SRC_DIR}ocbnet/slider/addons/carousel3d.js \
		> rtp.slider.js

minify:
	uglifyjs rtp.slider.js > rtp.slider.min.js
