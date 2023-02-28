require({cache:{
'url:com/huayun/webgis/templates/levelController.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div class=\"levelController-box\">\r\n        <div class=\"level-add-btn\" data-dojo-attach-point=\"levelAddBtn\" data-dojo-attach-event=\"onclick:levelAdd\"></div>\r\n        <ul class=\"level-bg\" data-dojo-attach-point=\"levelGradationBox\">\r\n            <li class=\"now-level\" id=\"targetLevel\">${nowLevel}</li>\r\n        </ul>\r\n        <div class=\"level-sub-btn\" data-dojo-attach-point=\"levelSubBtn\" data-dojo-attach-event=\"onclick:levelSub\"></div>\r\n    </div>\r\n</div>\r\n\r\n"}});
define(
    "com/huayun/webgis/widget/LevelController", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/dom-class",
        "./MapModuleX",
        "dojo/text!../templates/levelController.html"
    ], function (declare, topic, dom, domConstruct, domStyle, domClass, MapModuleX, template) {
        return declare("com.huayun.webgis.widget.LevelController", [MapModuleX], {
            baseClass: "levelController",
            _bottom: 90,
            _right: 10,
            templateString: template,
            // scaleHeight: 20,/*固定每个刻度的高度*/

            constructor: function () {
                this.view = null;
                this.nowLevel = 0;
                this.minLevel = 0;
                this.maxLevel = 0;
                this.scaleHeight = 20;

                topic.subscribe("changeLevel", function (data) {
                    this._levelChange(data);
                }.bind(this));
            },

            doInit: function () {
                this.view = this.get("view");
                if (this.view._load) {
                    this.nowLevel = this.view.level;
                    this.maxLevel = this.view.viewpoint.maxLevel;
                    var levelContainerHeight = this.maxLevel * this.scaleHeight;
                    domStyle.set(this.levelGradationBox, {
                        height: levelContainerHeight + "px",
                        backgroundColor: "white"
                    });
                    this.initScale();
                    this.initLevel();

                } else {
                    topic.subscribe("tileInfoComplete", function () {
                        this.nowLevel = this.view.level;
                        this.maxLevel = this.view.viewpoint.maxLevel;
                        var levelContainerHeight = this.maxLevel * this.scaleHeight;
                        domStyle.set(this.levelGradationBox, {
                            height: levelContainerHeight + "px",
                            backgroundColor: "white"
                        });
                        this.initScale();
                        this.initLevel();

                    }.bind(this));
                }
            },

            initScale: function () { //初始化刻度
                for (var i = 0; i < this.maxLevel; i++) {
                    domConstruct.create("li", {
                        innerHTML: "",
                        className: "level-gradation",
                        style: "height:" + this.scaleHeight + "px",
                        data_level: this.maxLevel - i,
                        click: function (evt) {
                            var level = evt.target.getAttribute("data_level");
                            level = parseInt(level);
                            if (level === this.view.level) return;
                            this.view.setLevel(level);
                            this._levelChange({level: level});
                        }.bind(this)
                    }, this.levelGradationBox, "last");
                }
            },

            initLevel: function () {
                var positionTop = this.scaleHeight * (this.maxLevel - this.view.level);
                this.showLevel();
                domStyle.set(dom.byId("targetLevel"), "top", positionTop + "px");
            },

            _levelChange: function (data) {
                if (typeof data === "undefined" || typeof data.level === "undefined") {
                    console.error("设置level为无效值,参数形式 e.g. {level:12}");
                } else {
                    if (this.nowLevel === data.level) return;
                    this.nowLevel = data.level;
                    var diffLevel = typeof data.diffLevel === "undefined" ? (this.maxLevel - this.nowLevel) : data.diffLevel;
                    var positionTop = this.scaleHeight * diffLevel;
                    this.showLevel();
                    domStyle.set(dom.byId("targetLevel"), "top", positionTop + "px");
                }
            },
            changeLevelByLocation: function (level, diffLevel) {/*根据定位的点设置等级*/
                this.nowLevel = level;
                var positionTop = this.scaleHeight * (diffLevel);
                this.showLevel();
                domStyle.set(dom.byId("targetLevel"), "top", positionTop + "px");
            },

            showLevel: function () {
                dom.byId("targetLevel").innerHTML = this.nowLevel;
            },

            levelSub: function () {
                this.view.zoomOut();
            },

            levelAdd: function () {
                this.view.zoomIn();
            }
        });
    });
