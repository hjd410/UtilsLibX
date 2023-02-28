/**
 *  @author :   overfly
 */
define(
    "com/huayun/webgis/widget/DrawStyleController", [
        "dojo/_base/declare",
        "dojo/dom",
        "dojo/topic",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-style",
        "./MapModuleX"
    ], function (declare, dom, topic, query, domClass, domConstruct, domStyle, MapModuleX) {
        return declare("com.huayun.webgis.widget.DrawStyleController", [MapModuleX], {
            map: null,

            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode,"background-color","#fff");
            },

            doInit: function () {
                this.map = this.get("map");
                var configData = this.get("configData");
                var dotWrapper = domConstruct.create("div", {style: "margin-left: 10px"}, this.domNode, "last");
                domConstruct.create("div", {innerHTML: "点符号: "}, dotWrapper, "last");
                var dotContainer = domConstruct.create("div", {}, dotWrapper, "last");
                var dotData = configData.dot, item;
                for (var i = 0; i < dotData.length; i++) {
                    item = dotData[i];
                    domConstruct.create("img", {
                        className: "dotStyle",
                        "src": item.src,
                        onclick: this.dotStyle.bind(this)
                    }, dotContainer, "last");
                }
                domConstruct.create("hr", {}, this.domNode, "last");

                var lineOuter = domConstruct.create("div", {style: "margin-left: 10px"}, this.domNode, "last");
                domConstruct.create("div", {innerHTML: "线符号: "}, lineOuter, "last");
                var lineContainer = domConstruct.create("div", {}, lineOuter, "last");
                var lineData = configData.line;
                for (i = 0; i < lineData.length; i++) {
                    item = lineData[i];
                    var lineWrapper = domConstruct.create("div", {
                        className: "lineStyle",
                        style: "width: 50px;"
                    }, lineContainer, "last");
                    if (item.type === "dash") {
                        domConstruct.create("div", {
                            className: item.type,
                            style: "width: 50px; margin-bottom: 10px; margin-top: 10px; border-top: 2px dashed black",
                            onclick: this.lineStyle.bind(this)
                        }, lineWrapper, "last");
                    } else {
                        domConstruct.create("div", {
                            className: item.type,
                            style: "width: 50px; margin-bottom: 10px; margin-top: 10px; border-top: 2px solid black",
                            onclick: this.lineStyle.bind(this)
                        }, lineWrapper, "last");
                    }
                }
                domConstruct.create("hr", {}, this.domNode, "last");

                var faceOuter = domConstruct.create("div", {style: "margin-left: 10px"}, this.domNode, "last");
                domConstruct.create("div", {innerHTML: "面符号: "}, faceOuter, "last");
                var polyContainer = domConstruct.create("div", {}, faceOuter, "last");
                var polyData = configData.polygon;
                for (i = 0; i < polyData.length; i++) {
                    item = polyData[i];
                    domConstruct.create("div", {
                        className: "polygonStyle",
                        title: item.color,
                        style: "width: 50px; height: 30px; margin-bottom: 10px; background-color: " + item.color,
                        onclick: this.polyStyle.bind(this)
                    }, polyContainer, "last");
                }
            },
            polyStyle: function (e) {
                e.stopPropagation();
                var name = e.target.title;
                // console.log(e);
                // console.log(name);
                var graphic = this.map.findLayerById("graphic");
                graphic.polygonMaterial = new THREE.MeshPhongMaterial({color: name});
                graphic.lineNodeMaterial = new THREE.PointsMaterial({size: 15, color: name});
                graphic.circleMaterial = new THREE.LineBasicMaterial({color: name});
                query(".polygonStyle").forEach(function (item) {
                    domClass.remove(item, "polygonStyleActive");
                });
                domClass.add(e.target, "polygonStyleActive");
            },
            dotStyle: function (e) {
                e.stopPropagation();
                var src = e.target.src;
                var graphic = this.map.findLayerById("graphic");
                graphic.dotSymbol.imageUrl = src;
                graphic.dotSymbol.vertical = true;
                graphic.dotSymbol.loaded = false;
                graphic.dotSymbol.color = null;
                // var dotNodes = query(".dotStyle");
                query(".dotStyle").forEach(function (item) {
                    domClass.remove(item, "dotStyleActive");
                });
                domClass.add(e.target, "dotStyleActive");
            },
            lineStyle: function (e) {
                e.stopPropagation();
                var type = e.target.className;
                var graphic = this.map.findLayerById("graphic");
                query(".lineStyle").forEach(function (item) {
                    domClass.remove(item, "lineStyleActive");
                });
                domClass.add(e.target.parentNode, "lineStyleActive");
                switch (type) {
                    case "dash":
                        graphic.lineMaterial = new THREE.LineDashedMaterial({
                            color: 0xFF0000,
                            dashSize: 10,
                            gapSize: 5
                        });
                        break;
                    default:
                        graphic.lineMaterial = new THREE.LineBasicMaterial({color: 0xFF0000});
                }
            }
        });
    });