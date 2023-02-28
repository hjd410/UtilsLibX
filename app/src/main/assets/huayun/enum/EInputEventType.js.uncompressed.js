/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/18
 *  @time   :   14:00
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/enum/EInputEventType", [], function () {

    return {
        MOUSEEVENT: 0,          // 总类，表示鼠标事件
        MOUSEDOWN: 1,           // 鼠标按下事件
        MOUSEUP: 2,             // 鼠标弹起事件
        MOUSEMOVE: 3,           // 鼠标移动事件
        MOUSEDRAG: 4,           // 鼠标拖动事件
        KEYBOARDEVENT: 5,       // 总类，键盘事件
        KEYUP: 6,               // 键盘弹起
        KEYDOWN: 7,             // 键盘按下
        KEYPRESS: 8             // 按键事件
    };
});
