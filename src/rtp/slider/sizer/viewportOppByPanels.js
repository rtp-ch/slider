/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport Height by Visibility Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/
(function (prototype, jQuery) {
    'use strict';

    prototype.plugin('config', function() {

        // default configuration
        this.conf = jQuery.extend(
            {
                autoVpOpp: true,
                autoVpOppDeadZone: 0.5
            },
            this.conf
        );
    });

    function viewportOppByVisibility () {

        // dead zone for out of view panel
        var dead_zone = this.conf.autoVpOppDeadZone || 1,
            opps = [],
            visibility = this.s_e;

        // check if feature is enabled
        if (this.conf.vertical || !this.conf.autoVpOpp){
            return;
        }

        // process all panel visibilites
        for (var i = 0; i < visibility.length; i++) {

            // skip if panel is not visible
            if (visibility[i] === 0) continue;

            // check if panel is fully visible
            if (visibility[i] > dead_zone) {
                // use full panel height
                opps.push(this.pd[1][i]);
            } else {
                // use a partial panel height (distribute from 0 to dead_zone)
                opps.push(this.pd[1][i] * visibility[i] / dead_zone);
            }
        }

        // set viewport opposite size
        this.vp_y = Math.max.apply(Math, opps);
        this.updateViewportOpp(this.vp_y);
    }

    prototype.plugin('layout', viewportOppByVisibility);

    prototype.plugin('layout', function() {
        if (this.conf.vertical) {
            this.readPanelsDim();
            this.updatePanelsOffset();
            this.setOffsetByPosition(this.position);
        }
    }, - 99999);


})(RTP.Slider.prototype, jQuery);
