/**
 * 鼠标滚轮缩放处理类, 函数防抖处理方式防止过度触发
 */
define("com/huayun/webgis/handler/ScrollZoomHandler", [
    "../utils/utils"
], function () {
    var wheelZoomDelta = 4.000244140625;
    var defaultZoomRate = 1 / 100;
    var wheelZoomRate = 1 / 450;
    var maxScalePerFrame = 2;

    function ScrollZoomHandler(params) {
        this.view = params.view;
        this.enabled = params.enabled === undefined ? true : !!params.enabled;

        this._lastWheelEventTime = 0;
        this._type = null;
        this._delta = 0;
        this._defaultZoomRate = defaultZoomRate;
        this._wheelZoomRate = wheelZoomRate;
    }

    ScrollZoomHandler.prototype.onWheel = function (e) {
        if (!this.enabled) {
            return;
        }
        var value = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 40 : e.deltaY;
        var now = utils.now(),
            timeDelta = now - this._lastWheelEventTime;
        this._lastWheelEventTime = now;

        if (value !== 0 && (value % wheelZoomDelta) === 0) {
            this._type = 'wheel';
        } else if (value !== 0 && Math.abs(value) < 4) {
            this._type = "trackpad";
        } else if (timeDelta > 400) {
            this._type = null;
            this._lastValue = value;
            this._timeout = setTimeout(this._onTimeout, 40, e);
        } else if (!this._type) {
            this._type = Math.abs(timeDelta * value) < 200 ? 'trackpad' : 'wheel';
            if (this._timeout) {
                clearTimeout(this._timeout);
                this._timeout = null;
                value += this._lastValue;
            }
        }

        if (e.shiftKey && value) {
            value = value / 4;
        }

        if (this._type) {
            this._lastWheelEvent = e;
            this._delta -= value;
            if (!this.active) {
                this._start(e);
            }
        }
        e.preventDefault();
    }

    ScrollZoomHandler.prototype._onTimeout = function (initialEvent) {
        this._type = 'wheel';
        this._delta -= this._lastValue;
        if (!this.active) {
            this._start(initialEvent);
        }
    }

    ScrollZoomHandler.prototype._start = function _start(e) {
        if (!this._delta) {
            return;
        }

        if (this._frameId) {
            this.view.cancelRenderFrame(this._frameId);
            this._frameId = null;
        }

        this.active = true;
        if (!this.isZooming) {
            this.zooming = true;
            // todo event
        }

        if (this._finishTimeout) {
            clearTimeout(this._finishTimeout);
        }

        var posX = e.clientX,
            posY = e.clientY;

        /* this._around = __chunk_1.LngLat.convert(this._aroundCenter ? this._map.getCenter() : this._map.unproject(pos));
         this._aroundPoint = this._map.transform.locationPoint(this._around);*/
        if (!this._frameId) {
            this._frameId = this.view.requestRenderFrame(this._onScrollFrame);
        }
    };

    ScrollZoomHandler.prototype._onScrollFrame = function () {
        var self = this;
        this._frameId = null;
        if (!this.active) return;

        if (this._delta !== 0) {
            var zoomRate = (this._type === 'wheel' && Math.abs(this._delta) > wheelZoomDelta) ? this._wheelZoomRate : this._defaultZoomRate;
            var scale = maxScalePerFrame / (1 + Math.exp(-Math.abs(this._delta * zoomRate)));
            if (this._delta < 0 && scale !== 0) {
                scale = 1 / scale;
            }
            
        }
    }


    return ScrollZoomHandler;
});
