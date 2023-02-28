/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/18
 *  @time   :   14:05
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/event/CanvasInputEvent", [
    '../enum/EInputEventType'
], function (EInputEventType) {

    /**
     * 构造函数
     * @param { EInputEventType } type
     * @param { boolean } altKey
     * @param { boolean } ctrlKey
     * @param { boolean } shiftKey
     * @constructor
     */
    function CanvasInputEvent(type, altKey, ctrlKey, shiftKey) {
        this.altKey = altKey;
        this.ctrKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.type = type;
    }

    return CanvasInputEvent;
});
