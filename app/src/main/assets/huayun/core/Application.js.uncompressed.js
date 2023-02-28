/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/18
 *  @time   :   10:31
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/core/Application", [
    '../enum/EInputEventType',
    '../event/CanvasMouseEvent',
    '../event/CanvasKeyBoardEvent',
    'custom/gl-matrix'
], function (EInputEventType, CanvasMouseEvent, CanvasKeyBoardEvent, glMatrix) {
    /**
     * 构造函数
     * @param { HTMLCanvasElement } canvas
     * @constructor
     */
    function Application(canvas) {

        this.isFlipYCoord = false;

        this.canvas = canvas;
        // 默认状态下不支持mousemove事件
        this.isSupportMouseMove = false;
        // 标记当前鼠标是否按下，目的是提供mousedrag事件
        this.isMouseDown = false;
        this.isRightMouseDown = false;

        // canvas元素能够监听鼠标事件
        this.canvas.addEventListener('mousedown', this, false);
        this.canvas.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);

        // 键盘事件不能在canvas中触发，但是能在全局的window对象中触发
        window.addEventListener('keydown', this, false);
        window.addEventListener('keyup', this, false);
        window.addEventListener('keypress', this, false);
    }

    /**
     *
     * @param { Event } evt
     */
    Application.prototype.handleEvent = function (evt) {
        switch (evt.type) {
            case 'mousedown':
                this.isMouseDown = true;
                this.onMouseDown(this._toCanvasMouseEvent(evt, EInputEventType.MOUSEDOWN));
                break;
            case 'mouseup':
                this.isMouseDown = false;
                this.onMouseUp(this._toCanvasMouseEvent(evt, EInputEventType.MOUSEUP));
                break;
            case 'mousemove':
                // 如果isSupportMouseMove为true，才会每次鼠标移动触发mouseMove事件
                if (this.isSupportMouseMove) {
                    this.onMouseMove(this._toCanvasMouseEvent(evt, EInputEventType.MOUSEMOVE));
                }
                // 同时，如果当前鼠标任意一个键处于按下状态并拖动时，触发drag事件
                if (this.isMouseDown) {
                    this.onMouseDrag(this._toCanvasMouseEvent(evt, EInputEventType.MOUSEDRAG));
                }
                break;
            case 'keypress':
                this.onKeyPress(this._toCanvasBoardEvent(evt, EInputEventType.KEYPRESS));
                break;
            case 'keydown':
                this.onKeyDown(this._toCanvasBoardEvent(evt, EInputEventType.KEYDOWN));
                break;
            case 'keyup':
                this.onKeyUp(this._toCanvasBoardEvent(evt, EInputEventType.KEYUP));
                break;
        }
    }

    /**
     * 鼠标按下
     * @param { CanvasMouseEvent } evt
     */
    Application.prototype.onMouseDown = function (evt) {

    }
    /**
     * 鼠标弹起
     * @param { CanvasMouseEvent } evt
     */
    Application.prototype.onMouseUp = function (evt) {

    }
    /**
     * 鼠标移动
     * @param { CanvasMouseEvent } evt
     */
    Application.prototype.onMouseMove = function (evt) {

    }
    /**
     * 鼠标拖动
     * @param { CanvasMouseEvent } evt
     */
    Application.prototype.onMouseDrag = function (evt) {

    }

    /**
     * 按键按下
     * @param { CanvasKeyBoardEvent } evt
     */
    Application.prototype.onKeyDown = function (evt) {

    }

    /**
     * 按键弹起
     * @param { CanvasKeyBoardEvent } evt
     */
    Application.prototype.onKeyUp = function (evt) {

    }

    /**
     * 按键事件
     * @param { CanvasKeyBoardEvent } evt
     */
    Application.prototype.onKeyPress = function (evt) {

    }

    /**
     * 将鼠标事件发生时鼠标指针的位置变换为相对当前canvas元素的偏移表示
     * 只要是鼠标事件都需要调用本方法
     * 将相对于浏览器viewport表示的点变换到相对canvas表示的点
     * @param { MouseEvent } evt
     * @return { vec2 }
     */
    Application.prototype._viewportToCanvasCoordinate = function (evt) {
        var rect = this.canvas.getBoundingClientRect();
        if (evt.target) {
            var x = evt.clientX - rect.left;
            var y = 0;
            y = evt.clientY - rect.top;  // 相对于canvas左上的偏移
            if (this.isFlipYCoord) {
                y = this.canvas.height - y;
            }
            // 变成矢量表示
            return glMatrix.vec2.fromValues(x, y);
        }
        throw new Error('evt.target为null');
    }

    /**
     *  将DOM Event对象信息转换为我们自己定义的CanvasMouseEvent事件
     * @param { Event | MouseEvent } evt
     * @param { EInputEventType } type
     * @private
     */
    Application.prototype._toCanvasMouseEvent = function (evt, type) {
        if (type === EInputEventType.MOUSEDOWN && evt.button === 2) {
            this.isRightMouseDown = true;
        } else if (type === EInputEventType.MOUSEUP && evt.button === 2) {
            this.isRightMouseDown = false;
        }

        var buttonNum = evt.button;

        if (this.isRightMouseDown && type === EInputEventType.MOUSEDRAG) {
            buttonNum = 2;
        }

        var mousePosition = this._viewportToCanvasCoordinate(evt);
        return new CanvasMouseEvent(type, mousePosition, buttonNum, evt.altKey, evt.ctrlKey, evt.shiftKey);

    }

    /**
     *  将DOM Event对象信息转换为我们自己定义的keyboard事件
     * @param { Event | KeyboardEvent } evt
     * @param { EInputEventType } type
     * @private
     */
    Application.prototype._toCanvasBoardEvent = function (evt, type) {
        return new CanvasKeyBoardEvent(type, evt.key, evt.keyCode, evt.repeat, evt.altKey, evt.ctrlKey, evt.shiftKey);
    }

    return Application;
});
