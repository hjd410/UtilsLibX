require({cache:{
'url:com/huayun/webgis/templates/buildingLocating.html':"<div class=\"${baseClass}\" style=\"pointer-events: all\">\r\n    <p class=\"buildingsList-title\">楼宇ID列表:</p>\r\n    <p class=\"clear-location\">\r\n        <button data-dojo-attach-event=\"onclick:clear\">清除定位</button>\r\n    </p>\r\n    <ul data-dojo-attach-point=\"buildingsListNode\" id=\"${buildingsListDomId}\"></ul>\r\n</div>\r\n"}});
/*
    定位功能部件
 */
define(
    "com/huayun/webgis/widget/BuildingLocating", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/topic",
        "dojo/on",
        "dojo/_base/query",
        "./MapModuleX",
        "../geometry/Polyline",
        "../symbols/LineSymbol2",
        "../Feature",
        "../Graphic",
        "../../webgis/geometry/Extent",
        "dojo/text!../templates/buildingLocating.html"
    ], function (declare, domClass, domConstruct, domAttr, topic, on, query, MapModuleX, Polyline, LineSymbol, Feature, Graphic, Extent, template) {
        return declare("com.huayun.webgis.widget.BuildingLocating", [MapModuleX], {
            buildingList: [
                {
                    id: 60222479,
                    coordinate: [
                        [515247.1251746025, 3349526.312457688],
                        [515247.29053951707, 3349527.569231035],
                        [515249.01033462305, 3349549.1328158295],
                        [515252.3507058872, 3349574.400574698],
                        [515253.77284414787, 3349594.012853506],
                        [515255.1949824095, 3349594.078999472],
                        [515258.7337915702, 3349593.3183208667],
                        [515268.1926646549, 3349590.8047741735],
                        [515268.1926646549, 3349526.312457688],
                        [515247.1251746025, 3349526.312457688]
                    ]
                },
                {
                    id: 60973823,
                    coordinate: [
                        [516656.53033716325, 3349579.096938257],
                        [516653.28918484785, 3349575.8888589246],
                        [516647.3360479409, 3349581.180536175],
                        [516644.3594794879, 3349584.3886155076],
                        [516642.54046543315, 3349589.4818548607],
                        [516650.4779813085, 3349598.1139033744],
                        [516642.0774436742, 3349605.456105559],
                        [516643.2349980725, 3349615.0472705746],
                        [516651.86704658624, 3349622.4225457422],
                        [516660.5321680838, 3349622.554837673],
                        [516667.5436404394, 3349614.088154073],
                        [516667.94051623344, 3349605.3238136284],
                        [516658.58086209744, 3349597.750100564],
                        [516666.9483267488, 3349588.1920085307],
                        [516659.5399785992, 3349581.8419958306],
                        [516656.53033716325, 3349579.096938257]
                    ]
                },
                {
                    id: 60216236,
                    coordinate: [
                        [517242.81510348246, 3349455.9000772806],
                        [517242.3190087406, 3349441.5464027394],
                        [517211.52806174196, 3349442.6378111728],
                        [517211.8918645531, 3349452.1959032053],
                        [517183.0522235399, 3349453.221165673],
                        [517183.61446424853, 3349469.261562337],
                        [517211.49498875905, 3349468.2693728525],
                        [517211.098112965, 3349457.024558696],
                        [517242.81510348246, 3349455.9000772806]
                    ]
                },
                {
                    id: 60216401,
                    coordinate: [
                        [517488.94424157403, 3350036.165560728],
                        [517488.4481468322, 3350040.398902528],
                        [517482.19735308085, 3350039.6712969067],
                        [517479.58458743803, 3350061.764049425],
                        [517490.8624745775, 3350063.0869687377],
                        [517493.9713349622, 3350036.7608744185],
                        [517488.94424157403, 3350036.165560728]
                    ]

                },
                {
                    id: 60225542,
                    coordinate: [
                        [518318.38157753274, 3349891.471260923],
                        [518269.59892788343, 3349890.3137065247],
                        [518269.2681980552, 3349904.1051403573],
                        [518318.08392068744, 3349905.2296217727],
                        [518318.38157753274, 3349891.471260923]
                    ]
                },
                {
                    id: 60226160,
                    coordinate: [
                        [519260.20090908743, 3349912.9025537856],
                        [519272.76864255685, 3349885.08817524],
                        [519247.4678107044, 3349873.67799617],
                        [519221.96854095627, 3349872.0574200116],
                        [519220.5133297127, 3349871.991274046],
                        [519220.0503079528, 3349879.7634250075],
                        [519236.6529453248, 3349880.6894685263],
                        [519264.4673238704, 3349894.3155374443],
                        [519259.93632522505, 3349903.5098266667],
                        [519256.49673501216, 3349901.8231045436],
                        [519252.8917798856, 3349909.396817607],
                        [519260.20090908743, 3349912.9025537856]
                    ]
                },
                {
                    id: 60224234,
                    coordinate: [[519061.2669174699, 3350557.92493758],
                        [519028.8223213302, 3350557.6603537174],
                        [519028.7231023824, 3350568.6075110286],
                        [519061.2669174699, 3350568.872094891],
                        [519061.2669174699, 3350557.92493758]
                    ]
                },
                {
                    id: 60151934,
                    coordinate: [
                        [521005.52835807577, 3352467.8566220272],
                        [520992.86140565854, 3352467.8235490443],
                        [520988.396552979, 3352475.8272108845],
                        [520998.12000992615, 3352481.7142018257],
                        [521005.52835807577, 3352467.8566220272]
                    ]
                }

            ],
            map: null,
            templateString: template,//本组件的template
            name: "",
            buildingsListDomId: "buildingsList-dom",
            baseClass: "buildingsList",
            backgroundColor: "",
            width: 400,
            height: "100%",
            graphicSceneLayer: null,
            drawLayer: null,
            _lineSymbol: null,
            _geometry: null,
            _feature: null,
            _currentGraphic: null,
            drawOptions: {
                color: 0x444444,
                lineWidth: 2
            },
            constructor: function () {
                this.maxLevel = 15;
            },
            doInit: function () {
                this.map = this.get("map");
                this.view = this.get("view");
                this.maxLevel = this.view.maxLevel;
                this.graphicSceneLayer = this.view.findLayerViewById("drawLayer");
                this.drawLayer = this.view.map.findLayerById("drawLayer");

                var self = this;
                this.createBuildingsList();
                topic.subscribe("extentChangeEvent", function () {
                        self.createBuildingsList();
                    }
                );

                this._lineSymbol = new LineSymbol({
                    wh: [this.view._containerWidth / 2, -this.view._containerHeight / 2],
                    color: new THREE.Color(0x0000FF),
                    width: 1
                });
                this._geometry = new Polyline();
                this._feature = new Feature({
                    attribute: null,
                    geometry: this._geometry
                });
                this._currentGraphic = new Graphic({
                    feature: this._feature,
                    symbol: this._lineSymbol
                });
                this.drawLayer.addGraphic(this._currentGraphic);
            },
            createBuildingsList: function () {
                var containerNode = document.getElementById(this.buildingsListDomId), self = this;
                if (containerNode) {
                    containerNode.innerHTML = "";
                    for (var i = 0; i < this.buildingList.length; i++) {
                        var item = this.buildingList[i];
                        domConstruct.create("li", {
                            innerHTML: item.id,
                            className: "building-item",
                            "data-building-id": item.id,
                            onclick: function (event) {
                                var target = event.target, id = target.getAttribute("data-building-id");
                                self._drawBuildingPath(id);
                                self._currentGraphic.refresh();
                            }
                        }, this.buildingsListNode, "last");
                    }
                }
            },
            _getMinRange: function (geoX_arr, geoY_arr) {/*根据地理坐标集合获取视线可视范围内的最小坐标边界点*/
                var min_geoX = Math.min.apply(null, geoX_arr),
                    max_geoX = Math.max.apply(null, geoX_arr),
                    min_geoY = Math.min.apply(null, geoY_arr),
                    max_geoY = Math.max.apply(null, geoY_arr);

                var extend = new Extent(min_geoX, min_geoY, max_geoX, max_geoY);
                this.view.setExtent(extend);
                var differLevel = this.maxLevel - this.view.level;
                topic.publish("changeLevel", {level: this.view.level, diffLevel: differLevel});
            },
            _drawBuildingPath: function (id) {
                var coordinates = null, allLinePath = [], geoX_arr = [], geoY_arr = [];
                for (var i = 0; i < this.buildingList.length; i++) {
                    if (id == this.buildingList[i].id.toString()) {
                        coordinates = this.buildingList[i].coordinate;/*获取建筑物的地理坐标*/
                    }
                }

                for (var i = 0; i < coordinates.length; i++) {
                    var coordinate = coordinates[i];
                    geoX_arr.push(coordinate[0]);
                    geoY_arr.push(coordinate[1]);
                    var geoX = coordinate[0].toString(), geoY = coordinate[1].toString();
                    allLinePath.push({x: geoX, y: geoY, z: 0});
                }
                this._geometry.setPath([allLinePath]);
                this._getMinRange(geoX_arr, geoY_arr);
            },
            clear: function () {
                // this.graphicSceneLayer.clear();
                this._currentGraphic.clear();/*清除当前Graphic, graphicSceneLayer有多个_currentGraphic*/
            }
        })
    }
);