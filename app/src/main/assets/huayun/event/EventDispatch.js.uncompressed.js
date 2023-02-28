/**
 *  @author :   JiGuangJie
 *  @date   :   2019/1/22
 *  @time   :   15:16
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/event/EventDispatch", [
        "dojo/_base/declare"
    ], function (declare) {
        return declare("com.huayun.event.EventDispatch", null, {
            _eventList: null,
            constructor: function () {
                this._eventList = {};
            },
            /**
             * 添加事件监听
             * @param type 
             * @param fun 
             * @param context 
             */
            addEventListener: function (type, fun, context) {
                var list = this._eventList[type];
                if (list === undefined) {
                    list = [];
                    this._eventList[type] = list;
                }
                var lis = {
                    func: fun,
                    context: context
                };
                list.push(lis);
                return lis;
            },
            /**
             * 移除事件监听
             * @param type 
             * @param fun 
             * @param context 
             */
            removeEventListener: function (type, fun, context) {
                var list = this._eventList[type];
                if (list !== undefined) {
                    var size = list.length;
                    for (var i = 0; i < size; i++) {
                        var obj = list[i];
                        if (obj.func === fun && obj.context === context) {
                            list.splice(i, 1);
                            return;
                        }
                    }
                }
            },
            /**
             * 判断事件列表中是否有事件监听
             * @param type 
             */
            hasEventListener: function (type) {
                var list = this._eventList[type];
                if (list !== undefined) {
                    return true;
                } else {
                    return false;
                }
            },
            /**
             * 事件派遣
             * @param type 
             * @param event 
             */
            dispatchEvent: function (type, event) {
                var list = this._eventList[type];
                if (list !== undefined) {
                    var size = list.length;
                    for (var i = 0; i < size; i++) {
                        var ef = list[i];
                        var fun = ef.func;
                        var context = ef.context;
                        if (context !== null) {
                            fun.call(context, event);
                        } else {
                            fun(event);
                        }
                    }
                }
            }
        });
    }
);