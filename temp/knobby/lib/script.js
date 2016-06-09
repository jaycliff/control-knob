if (typeof Math.toDegrees !== "function") {
    Math.toDegrees = function toDegrees(radians) {
        "use strict";
        return (radians * 180) / Math.PI;
    };
}
(function (global) {
    "use strict";
    // Write your awesome code here.
    var $document = jQuery(document);
    $document.ready(function ($) {
        var $ck_wrap = $('.control-knob-wrap'),
            $ck_handle = $ck_wrap.find('.control-knob-handle'),
            $ck_anchor = $ck_wrap.find('.control-knob-anchor'),
            $tick = $ck_wrap.find('.control-knob-tick'),
            $ck_value = $ck_wrap.find('.control-knob-value'),
            $current_value = $ck_wrap.find('.current-value'),
            knob_center = {
                getX: function getX() {
                    return $ck_anchor.getX() + ($ck_anchor.outerWidth() / 2);
                },
                getY: function getY() {
                    return $ck_anchor.getY() + ($ck_anchor.outerHeight() / 2);
                }
            },
            angle = 0,
            angle_additive = 0,
            radian_diff = 0,
            minangle = 0,
            maxangle = 270,
            prev_radians,
            max_radians = (360 * Math.PI) / 180,
            active = false,
            css_options = {
                '-moz-transform': 'rotate(0deg)',
                '-webkit-transform': 'rotate(0deg)',
                '-o-transform': 'rotate(0deg)',
                '-ms-transform': 'rotate(0deg)',
                'transform': 'rotate(0deg)'
            },
            hasOwnProperty = Object.prototype.hasOwnProperty,
            prevX,
            prevY;
            
        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        
        function getRadians(mouse_x, mouse_y) {
            var rad = Math.atan2(knob_center.getY() - mouse_y, mouse_x - knob_center.getX());
            if (rad < 0) {
                rad = max_radians + rad;
            }
            return rad;
        }
        
        function setAngle() {
            var active_ticks, percent, k, len, key, rotate = 'rotate(' + angle + 'deg)';
            // rotate knob
            for (key in css_options) {
                if (hasOwnProperty.call(css_options, key)) {
                    css_options[key] = rotate;
                }
            }
            $ck_handle.css(css_options);
            // highlight ticks
            active_ticks = (Math.floor(angle / 10) + 1);
            $tick.removeClass('active');
            //$tick.slice(0, active_ticks).addClass('activetick');
            for (k = 0, len = active_ticks; k < len; k += 1) {
                $tick[k].classList.add('active');
            }
            // update % value in text
            percent = (angle / 270);
            //console.log(percent);
            var value_text = Math.round(percent * 100) + '%';
            $ck_value.text(value_text);
            $current_value.text(value_text);
        }
        
        function moveKnob(direction) {
            //var angle_additive = 1;
            switch (direction) {
            case 'up':
                angle_additive = 2;
                break;
            case 'down':
                angle_additive = -2;
                break;
            }
            angle = angle + angle_additive;
            if (angle > maxangle) {
                angle = maxangle;
            }
            if (angle < minangle) {
                angle = minangle;
            }
            setAngle();
        }
        
        // mousewheel event - firefox
        $ck_handle.on('DOMMouseScroll', function (e) {
            e.preventDefault();
            if (e.originalEvent.detail > 0) {
                moveKnob('down');
            } else {
                moveKnob('up');
            }
            //console.log('DOMMouseScroll');
        });
        
        // mousewheel event - ie, safari, opera
        $ck_handle.on('mousewheel', function (e) {
            e.preventDefault();
            if (e.originalEvent.wheelDelta < 0) {
                moveKnob('down');
            } else {
                moveKnob('up');
            }
            //console.log(e);
        });
        
        function documentEventHandler(e) {
            var nowX, nowY, now_radians;
            e.preventDefault();
            switch (e.type) {
            case 'touchmove':
                e.pageX = e.originalEvent.touches[0].pageX;
                e.pageY = e.originalEvent.touches[0].pageY;
            case 'mousemove':
                nowX = e.pageX;
                nowY = e.pageY;
                if (prevX === nowX && prevY === nowY) {
                    console.log('faux mousemove');
                    return;
                }
                now_radians = getRadians(nowX, nowY);
                radian_diff = prev_radians - now_radians;
                console.log(radian_diff);
                if (radian_diff < 0) {
                    if (Math.abs(radian_diff) > max_radians / 2) {
                        radian_diff += max_radians;
                        console.log('POSITIVE COMPENSATION');
                    }
                } else if (radian_diff > 0) {
                    if (radian_diff > max_radians / 2) {
                        radian_diff -= max_radians;
                        console.log('NEGATIVE COMPENSATION');
                    }
                }
                angle_additive = Math.toDegrees(radian_diff);
                moveKnob();
                prev_radians = now_radians;
                prevX = nowX;
                prevY = nowY;
                break;
            case 'touchend':
            case 'mouseup':
                angle_additive = 0;
                radian_diff = 0;
                $document.off('mousemove mouseup touchmove touchend', documentEventHandler);
                active = false;
                break;
            }
        }
        
        $ck_handle.on('mousedown touchstart', function (e) {
            e.preventDefault();
            switch (e.type) {
            case 'touchstart':
                e.pageX = e.originalEvent.touches[0].pageX;
                e.pageY = e.originalEvent.touches[0].pageY;
            case 'mousedown':
                active = true;
                prevX = e.pageX;
                prevY = e.pageY;
                prev_radians = getRadians(prevX, prevY);
                $document.on('mousemove mouseup touchmove touchend', documentEventHandler);
                break;
            }
        });
        
        $ck_wrap.on('mousedown touchstart', function (e) {
            e.preventDefault();
        });
        
        $ck_value.text('0%');
        window.$ck_handle = $ck_handle;
    });
}(window));