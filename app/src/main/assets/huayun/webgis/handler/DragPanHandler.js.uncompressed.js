define("com/huayun/webgis/handler/DragPanHandler", [
    "../geometry/Point",
    "../utils/utils"
], function (Point, utils) {
    const clickTolerance = 2;
    const DragPanState = {
        "active": 4,
        "enabled": 2,
        "pending": 1,
        "disabled": 0
    };
    const inertiaLinearity = 0.3;
    const inertiaMaxSpeed = 1400; // px/s
    const inertiaDeceleration = 2500;
    const inertiaEasing = utils.bezier(0, 0, inertiaLinearity, 1);

    function DragPanHandler(view, options) {
        options = options || {};
        this.view = view;
        this._state = DragPanState.disabled;
        this.clickTolerance = options.clickTolerance || clickTolerance;
    }

    DragPanHandler.prototype.isEnabled = function () {
        return this._state !== DragPanHandler.disabled;
    }

    DragPanHandler.prototype.enable = function () {
        if (this.isEnabled()) return;
        this._state = DragPanState.enabled;
    }

    DragPanHandler.prototype.onMouseDown = function (e) {
        if (this._state !== DragPanState.enabled) {
            return;
        }
        window.document.addEventListener("mousemove", this._onMove, true);
        window.document.addEventListener("mouseup", this._onMouseUp);
    }

    DragPanHandler.prototype._start = function (e) {
        window.addEventListener('blur', this._onBlur);
        this._state = DragPanState.pending;
        this._startPos = this._mouseDownPos = this._prevPos = this._lastPos = new Point(e.clientX - this.view._offsetLeft, e.clientY - this.view._offsetTop);
        this._inertia = [[utils.now(), this._startPos]];
    }

    DragPanHandler.prototype._onMove = function (e) {
        e.preventDefault();
        var pos = new Point(e.clientX - this.view._offsetLeft, e.clientY - this.view._offsetTop);
        if (this._lastPos.equals(pos) || (this._state === DragPanState.pending && pos.dist(this._mouseDownPos) < this.clickTolerance)) {
            return;
        }
        this._lastMoveEvent = e;
        this._lastPos = pos;
        this._drainInertiaBuffer();
        this._inertia.push([utils.now(), this._lastPos]);
        if (this._state === DragPanState.pending) {
            this._state = DragPanState.active;
        }
        if (!this._frameId) {

        }
    }

    DragPanHandler.prototype._onDragFrame = function () {

    }

    DragPanHandler.prototype._drainInertiaBuffer = function () {
        var inertia = this._inertia,
            now = utils.now(),
            cutoff = 160;
        while (inertia.length > 0 && now - inertia[0][0] > cutoff) {
            inertia.shift();
        }
    };

    DragPanHandler.prototype._onMouseUp = function (e) {
        if (e.button !== 0) {
            return;
        }
        switch (this._state) {
            case DragPanState.active:
                this._state = DragPanState.enabled;
                this._unbind();
                this._deactivate();
                this._inertiaPan(e);
                break;
            case DragPanState.pending:
                this._state = DragPanState.enabled;
                this._unbind();
                break;
        }
    }

    DragPanHandler.prototype._onBlur = function (e) {

    }

    DragPanHandler.prototype._unbind = function () {
        window.removeEventListener('mousemove', this._onMove, true);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('blur', this._onBlur);
    }

    DragPanHandler.prototype._deactivate = function () {
        if (this._frameId) {

        }
    }

    DragPanHandler.prototype._inertiaPan = function (e) {
        this._drainInertiaBuffer();
        var inertia = this._inertia;
        if (inertia.length < 2) {
            return;
        }
        var last = inertia[inertia.length - 1],
            first = inertia[0],
            flingOffset = last[1].sub(first[1]),
            flingDuration = (last[0] - first[0])/1000;
        if (flingDuration === 0 || last[1].equals(first[1])) {
            return;
        }

        var velocity = flingOffset.mult(inertiaLinearity / flingDuration);
        var speed = velocity.mag(); // px/s
        if (speed > inertiaMaxSpeed) {
            speed = inertiaMaxSpeed;
            velocity._unit()._mult(speed);
        }
        var duration = speed/(inertiaDeceleration * inertiaLinearity),
            offset = velocity.mult(-duration / 2);

    }

    return DragPanHandler;
})