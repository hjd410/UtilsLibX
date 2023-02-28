define("com/huayun/webgis/handler/PanHandler-Backup", [
    "dojo/_base/declare",
    "dojo/on"
], function (declare, on) {
    return declare("com.huayun.webgis.handler.PanHandler", [], {
        view: null,
        _mouseDown: false,
        _fromX: 0,
        _fromY: 0,
        _toX: 0,
        _toY: 0,
        mouseMove: null,
        mouseUp: null,
        panRaf: null,
        mapMouseClickTolerance: 0,
        isPanning: false,
        isRotating: false,
        isSwitching: false,


        constructor: function (view) {
            this.view = view;
            this._mouseDown = false;
            this.mapMouseClickTolerance = 3;
            // 禁止鼠标右键菜单
            oncontextmenu = function () {
                return false;
            };
            this.panRaf = null;
            var obj = this;
            on(view.domNode, "mousedown", function (e) {
                if (e.button == 0 && view.panEnabled) {//点击左键
                    obj._fromX = e.x;
                    obj._fromY = e.y;
                    obj._mouseDown = true;
                    if (!obj.isPanning){
                        obj._toX = e.x;
                        obj._toY = e.y;
                    }
                    obj.mouseMove = on(document, "mousemove", function (e) {
                        obj.mouseMoveHandler(e);
                    });
                    obj.mouseUp = on(document, "mouseup", function (e) {
                        obj.mouseUpHandler(e)
                    });
                    obj.enterFrameHandler();

                } else if (e.button == 2 && view.rotateEnabled) {//点击右键
                    obj._fromX = e.x;
                    obj._fromY = e.y;
                    obj._mouseDown = true;
                    if (!obj.isRotating || !obj.isSwitching) {
                        obj._toX = e.x;
                        obj._toY = e.y;
                    }
                    obj.mouseMove = on(this, "mousemove", function (e) {
                        obj.rightMoveHandle(e);
                    });
                    obj.mouseUp = on(this, "mouseup", function (e) {
                        obj.rightUpHandle(e)
                    });
                    obj.enterFrameHandler2();
                }
            });
        },
        /**
         * 鼠标右键拖动
         * @param e
         */
        rightMoveHandle: function (e) {
            /*e.preventDefault();
            e.stopPropagation();*/
            this._toX = e.x;
            this._toY = e.y;
        },
        /**
         * 鼠标右键弹起
         * @param e
         */
        rightUpHandle: function (e) {
            /*e.stopPropagation();
            e.preventDefault();*/
            if (this.isRotating) {
                this.isRotating = false;
                this.view._stopMouseRotate();
            }
            if (this.isSwitching){
                this.isSwitching = false;
                this.view._stopSwitch();
            }
            this._mouseDown = false;
            this.mouseMove.remove();
            this.mouseUp.remove();
            this.view.handlePushViewState();
            window.cancelAnimationFrame(this.panRaf);
        },

        /**
         * 鼠标拖动
         * @param e
         */
        mouseMoveHandler: function (e) {
            // e.preventDefault();
            // e.stopPropagation();
            this._toX = e.x;
            this._toY = e.y;
        },
        /**
         * 鼠标弹起
         * @param e
         */
        mouseUpHandler: function (e) {
            // e.stopPropagation();
            // e.preventDefault();
            if (this.isPanning) {
                this.isPanning = false;
                this.view.stopMove();
            }
            this._mouseDown = false;
            this.mouseMove.remove();
            this.mouseUp.remove();
            this.view.handlePushViewState();
            window.cancelAnimationFrame(this.panRaf);
        },
        /**
         * 点击左键后执行方法
         */
        enterFrameHandler: function () {
            if (!this._mouseDown) {
                return;
            }

            var xmove = this._toX - this._fromX,
                ymove = this._toY - this._fromY;
            if (this.isPanning) {
                if (Math.abs(ymove) < 5 && Math.abs(xmove) < 5) {
                    this.isPanning = false;
                    this.view.stopMove();
                    this._fromX = this._toX;
                    this._fromY = this._toY;
                } else {
                    this.isPanning = true;
                    this.view.mapMove(xmove, ymove);
                    this._fromX = this._toX;
                    this._fromY = this._toY;
                }
            } else {
                if (Math.abs(xmove) >= this.mapMouseClickTolerance || Math.abs(ymove) >= this.mapMouseClickTolerance) {
                    this.isPanning = true;
                    this._fromX = this._toX;
                    this._fromY = this._toY;
                }
            }
            this.panRaf = window.requestAnimationFrame(this.enterFrameHandler.bind(this));
        },
        /**
         * 点击右键后执行方法
         */
        enterFrameHandler2: function () {
            if (!this._mouseDown) {
                return;
            }
            var xmove = this._toX - this._fromX,
                ymove = this._toY - this._fromY;
            if (this.isRotating || this.isSwitching) {
                if (Math.abs(ymove) < 5 && Math.abs(xmove) < 5) {
                    if (this.isSwitching) {
                        this.isSwitching = false;
                        this.view._stopSwitch();
                        this._fromX = this._toX;
                        this._fromY = this._toY;
                    }
                    if (this.isRotating) {
                        this.isRotating = false;
                        this.view._stopMouseRotate();
                        this._fromX = this._toX;
                        this._fromY = this._toY;
                    }
                } else {
                    if (Math.abs(xmove) > Math.abs(ymove)) {
                        this.isRotating = true;
                        this.isSwitching = false;
                        this.view._mouseRotate(xmove);
                    } else {
                        this.isSwitching = true;
                        this.isRotating = false;
                        this.view._mouseSwitchDip(ymove);
                    }
                    this._fromX = this._toX;
                    this._fromY = this._toY;
                }
            } else {
                if (Math.abs(xmove) >= this.mapMouseClickTolerance || Math.abs(ymove) >= this.mapMouseClickTolerance) {
                    if (Math.abs(xmove) > Math.abs(ymove)) {
                        this.isRotating = true;
                        this.isSwitching = false;
                    } else {
                        this.isSwitching = true;
                        this.isRotating = false;
                    }
                    this._fromX = this._toX;
                    this._fromY = this._toY;
                }
            }
            this.panRaf = window.requestAnimationFrame(this.enterFrameHandler2.bind(this));
        }
    });
});
