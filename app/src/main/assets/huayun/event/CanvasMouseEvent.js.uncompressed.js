/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/18
 *  @time   :   14:25
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/event/CanvasMouseEvent", [
    './CanvasInputEvent'
], function (CanvasInputEvent) {
    function CanvasMouseEvent(type, canvasPos, button, altKey, ctrlKey, shiftKey) {
        CanvasInputEvent.call(this, type, altKey, ctrlKey, shiftKey);
        this.canvasPosition = canvasPos;
        this.button = button;
        this.target = null;
    }

    if (CanvasInputEvent) CanvasMouseEvent.__proto__ = CanvasInputEvent;
    CanvasMouseEvent.prototype = Object.create(CanvasInputEvent && CanvasInputEvent.prototype);
    CanvasMouseEvent.prototype.constructor = CanvasMouseEvent;

    return CanvasMouseEvent;
});
