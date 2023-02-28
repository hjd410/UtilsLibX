define("com/huayun/webgis/handler/TouchHandler", [
  'dojo/_base/declare',
  'dojo/on'
], function (declare, on, debounce) {
  return declare("com.huayun.webgis.handler.TouchHandler", [], {
    view: null,
    _touch: false,
    _zoom: false,
    _fromX: 0,
    _fromY: 0,
    _fromX1: 0,
    _fromY1: 0,
    _toX: 0,
    _toY: 0,
    _toX1: 0,
    _toY1: 0,
    touchMove: null,
    touchUp: null,
    touchRaf: null,
    mapTouchTolerance: 0,
    isTouching: false,
    isZooming: false,
    zoomUp: null,
    zoomMove: null,

    constructor: function (view) {
      this.view = view;
      this.mapTouchTolerance = 3;
      this.touchRaf = null;
      var obj = this;

      on(view.domNode, "touchstart", function (e) {
        e.preventDefault();
        var touches = e.targetTouches || e.touches;
        if (touches.length < 2 && view.panEnabled) { // 进入平移
          obj._fromX = e.targetTouches[0].clientX;
          obj._fromY = e.targetTouches[0].clientY;
          obj._touch = true;
          if (!obj.isTouching) {
            obj._toX = e.targetTouches[0].clientX;
            obj._toY = e.targetTouches[0].clientY;
          }
          obj.touchMove = on(document, "touchmove", function (e) {
            obj.touchMoveHandler(e);
          });
          obj.touchUp = on(document, "touchend", function (e) {
            obj.touchUpHandler(e);
          });
          obj.enterFrameHandler();
        }
        if (touches.length > 1 && view.zoomEnabled) { // 进入缩放
          obj._touch = false;
          obj.isTouching = false;
          if (obj.touchMove) {
            obj.touchMove.remove();
            obj.touchUp.remove();
          }
          obj._zoom = true;
          var sx = e.targetTouches[0].clientX,
            ex = e.targetTouches[1].clientX,
            sy = e.targetTouches[0].clientY,
            ey = e.targetTouches[1].clientY;
          obj.cx = (sx + ex) / 2;
          obj.cy = (sy + ey) / 2;
          obj.lastLen = Math.sqrt((sx - ex) * (sx - ex) + (sy - ey) * (sy - ey));

          /*obj.touchUp = on(document, "", function(e) {
              obj.touchUpHandler(e);
          });*/
          obj.zoomMove = on(document, "touchmove", obj.zoomMoveHandler.bind(obj));
          obj.zoomEnd = on(document, "touchend", obj.zoomEndHandle.bind(obj));
        }
      })
    },

    zoomEndHandle: function (e) {
        if (this.view.zoomEnabled) {
            var touch = e.touches || e.targetTouches;
            var dx = touch[0].clientX - touch[1].clientX,
              dy = touch[0].clientY - touch[1].clientY;
            var len = Math.sqrt(dx * dx + dy * dy);
            if (len - this.lastLen > 5) {
                this.view.zoomInWheel(this.cx, this.cy);
                this.lastLen = len;
            } else if (len - this.lastLen < -5) {
                this.view.zoomOutWheel(this.cx, this.cy);
                this.lastLen = len;
            }
        }
        this.zoomMove.remove();
        this.zoomEnd.remove();
    },

    zoomMoveHandler: function (e) {
      if (this.view.zoomEnabled) {
        var touch = e.touches || e.targetTouches;
        var dx = touch[0].clientX - touch[1].clientX,
          dy = touch[0].clientY - touch[1].clientY;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len - this.lastLen > 5) {
          this.view.zoomInWheel(this.cx, this.cy);
          this.lastLen = len;
        } else if (len - this.lastLen < -5) {
          this.view.zoomOutWheel(this.cx, this.cy);
          this.lastLen = len;
        }
      }
    },

    /**
     * 手指滑动
     * @param e
     */
    touchMoveHandler: function (e) {
      var touches = e.targetTouches || e.touches;
      if (touches.length < 2) {
        this._toX = e.targetTouches[0].clientX;
        this._toY = e.targetTouches[0].clientY;
      }
    },

    /**
     * 手指弹开
     * @param e
     */
    touchUpHandler: function (e) {
      var touches = e.targetTouches || e.touches;
      if (touches.length < 2) {
        if (this.isTouching) {
          this.isTouching = false;
          this.view.stopMove();
        }
        this._touch = false;
        this.touchMove.remove();
        this.touchUp.remove();
        this.view.handlePushViewState();
        window.cancelAnimationFrame(this.touchRaf);
      }
    },

    enterFrameHandler: function () {
      if (!this._touch) {
        return;
      }
      var xmove = this._toX - this._fromX,
        ymove = this._toY - this._fromY;
      if (this.isTouching) {
        if (Math.abs(ymove) < 5 && Math.abs(xmove) < 5) {
          this.isTouching = false;
          this.view.stopMove();
          this._fromX = this._toX;
          this._fromY = this._toY;
        } else {
          this.isTouching = true;
          this.view.mapMove(xmove, ymove);
          this._fromX = this._toX;
          this._fromY = this._toY;
        }
      } else {
        if (Math.abs(xmove) >= this.mapTouchTolerance || Math.abs(ymove) >= this.mapTouchTolerance) {
          this.isTouching = true;
          this._fromX = this._toX;
          this._fromY = this._toY;
        }
      }
      this.touchRaf = window.requestAnimationFrame(this.enterFrameHandler.bind(this));
    }
  });
});