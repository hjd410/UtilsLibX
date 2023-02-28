require({cache:{
'url:com/huayun/webgis/templates/timeLine.html':"<div style=\"width: 100%; height: 140px;font-size: 14px;box-shadow: 0 -2px 2px #dddddd;display: none\">\r\n    <div style=\"width: 100%; height: 40px; background: white\">\r\n        <div class=\"head left\">\r\n            <span class=\"${_arrow}\" data-dojo-attach-event=\"ondijitclick: openOrClose\"></span> <span>时间</span>\r\n        </div>\r\n        <div class=\"head center\">\r\n            24小时时间轴\r\n        </div>\r\n        <div class=\"head right\">\r\n            <span class=\"headSet\"></span> <span>设置</span>\r\n        </div>\r\n    </div>\r\n    <div style=\"width: 100%; height: 80px; background: white; display: ${_display}\" data-dojo-attach-point=\"timeLineContainer\">\r\n        <div class=\"contentLeft\">\r\n            <div class=\"stopOrGo\" data-dojo-attach-point=\"controllerNode\" data-dojo-attach-event=\"ondijitclick: stopOrGo\"></div>\r\n        </div>\r\n        <div class=\"contentCenter\">\r\n            <div class=\"bgLine\"></div>\r\n            <div class=\"colorLine\">\r\n                <div class=\"timeLineStart\"></div>\r\n                <div class=\"colorLineContent\" data-dojo-attach-point=\"colorLineNode\"></div>\r\n                <div class=\"timeLineEnd\" data-dojo-attach-point=\"timeLineEndNode\"></div>\r\n            </div>\r\n            <div class=\"timeLine\">\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"scale\"></div>\r\n                <div class=\"lastScale\"></div>\r\n                <div class=\"notScale\"></div>\r\n            </div>\r\n        </div>\r\n        <div class=\"contentRight\">\r\n            <span class=\"slow\" data-dojo-attach-event=\"ondijitclick: goSlow\"></span><span class=\"quick\" data-dojo-attach-event=\"ondijitclick: goQuick\"></span>\r\n        </div>\r\n    </div>\r\n</div>"}});
/**
 * 时间刻度线
 */
define("com/huayun/webgis/widget/TimeLine", [
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_OnDijitClickMixin",
    "dojo/text!../templates/timeLine.html"
], function (declare, topic, _WidgetBase, _TemplatedMixin,_OnDijitClickMixin, template) {
    return declare("com.huayun.webgis.widget.TimeLine",[_WidgetBase, _TemplatedMixin,_OnDijitClickMixin], {
        baseClass:"timeLine",
        templateString: template,
        display: true,
        _display: "block",
        _arrow: "arrowOpen",
        _play: true,
        time: 0,

        constructor: function (params) {
            declare.safeMixin(this, params);
            if (this.display) {
                this._display = "block";
                this._arrow = "arrowOpen";
            } else {
                this._display = "none";
                this._arrow = "arrowClose";
            }
        },
        openOrClose: function (e) {
            var target = e.target;
            if (this.display) { // 关闭
                target.className = "arrowClose";
                this.display = false;
                this.timeLineContainer.style.display = "none";
            }else {
                target.className = "arrowOpen";
                this.display = true;
                this.timeLineContainer.style.display = "block";
            }
        },
        stopOrGo: function (e) {
            var target = e.target;
            if (this._play) { // 暂停
                target.className = "stopOrGoNo";
                this._play = false;
                topic.publish("timeLineStop");
            }else { // 播放
                target.className = "stopOrGo";
                this._play = true;
                topic.publish("timeLineGo");
            }
        },
        _setTimeAttr: function (time) {
            var ratio = (time/60)*4.1;
            this.colorLineNode.style.width = ratio + "%";
            this.timeLineEndNode.style.left = "calc(" + ratio + "% - 9px)";
        },
        goQuick: function () {
            topic.publish("timeHeatmapInterval", -1000);
        },
        goSlow: function () {
            topic.publish("timeHeatmapInterval", 1000);
        }
    });
});