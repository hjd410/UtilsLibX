/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/18
 *  @time   :   14:25
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/event/CanvasKeyBoardEvent", [
    './CanvasInputEvent'
], function (CanvasInputEvent) {
    function CanvasKeyBoardEvent(type, key, keyCode, repeat, button, altKey, ctrlKey, shiftKey) {
        CanvasInputEvent.call(this, type, altKey, ctrlKey, shiftKey);
        this.key = key;
        this.keyCode = keyCode;
        this.repeat = repeat;   // 当前按下的键是否不停的触发事件
    }

    if (CanvasInputEvent) CanvasKeyBoardEvent.__proto__ = CanvasInputEvent;
    CanvasKeyBoardEvent.prototype = Object.create(CanvasInputEvent && CanvasInputEvent.prototype);
    CanvasKeyBoardEvent.prototype.constructor = CanvasKeyBoardEvent;

    return CanvasKeyBoardEvent;
});
