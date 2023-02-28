/**
 * 地名搜索
 */
define("com/huayun/webgis/widget/searchs/NameSearch", [
  "require",
    "dojo/on",
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/form/Select",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "../../../util/WKTGeometryFormater",
    "../../geometry/MapPoint",
    "../../Feature",
    "../../Graphic",
    "../../geometry/Extent",
    "../../geometry/Point",
    "../../../facades/AgsFacade",
    "../../symbols/ImageSymbol",
    "../MapModuleX",
    "dojo/text!../../templates/searchs/nameSearch.html"
], function (require, on, declare, domClass, domStyle, Select, Memory, ObjectStore, WKTGeometryFormater, MapPoint, Feature, Graphic, Extent, Point, AgsFacade, ImageSymbol, MapModuleX, template) {
    return declare("com.huayun.webgis.widget.searchs.NameSearch", [MapModuleX], {
        templateString: template,
        baseClass: "nameSearch",

        postCreate: function () {
            this.inherited(arguments);
            this._agsFacade = new AgsFacade();
            this._currentPage = 1;
            this._defaultValue = 5; //默认一页展示的数量
            this.agsUrl = "";
            this.addressList = [];
        },
        doInit: function () {
            this.view = this.get("view");
            this.changeMethod = null;

            this.wktGeometryFormater = new WKTGeometryFormater();
            this.locationGraphic = null;

            this._imageSymbol = new ImageSymbol({
                url: require.toUrl("com/huayun/webgis/css/images/red.png"),
                // url: "../dojo/com/huayun/webgis/css/images/red.png",
                width: 21,
                height: 33
            });
            //
            this._locationImageSymbol = new ImageSymbol({
                // url: "../dojo/com/huayun/webgis/css/images/blue.png",
                url:  require.toUrl("com/huayun/webgis/css/images/blue.png"),
                width: 21,
                height: 33
            });

            this.graphics = [];

            this.zoneSelect = new Select({
                name: "zoneName",
                class: "type-select__node"
            }, this.zoneSelectNode);
            this.zoneSelect.startup();
            //获取城市名称列表
            this._agsFacade.getCityCodeData(this.agsUrl, function (resp) {
                // debugger
                if (resp.code === "1000") {
                    var addressList = resp.detail;
                    var store = new Memory({
                        idProperty: "cityCode",
                        data: addressList
                    });
                    var os = new ObjectStore({objectStore: store, labelProperty: "name"});
                    this.zoneSelect.setStore(os);
                    // debugger
                    this.zoneSelect.set("value", "33401");
                }
            }.bind(this), function (err) {
                console.log(err);
            });

        },
        focusHandle: function () {
            var e = e ? e : window.event, target = e.target;
            target.focus();
        },

        compositionstartHandler: function () {
            console.log("start");
        },
        compositionendHandler: function () {
            console.log("end");
        },
        oninputHandler: function (e) {
            if (this.cnameNode.value.length > 0) {
                // debugger
                domClass.remove(this["closeBtnNode"], "hidden");
            } else {
                domClass.add(this.closeBtnNode, "hidden");
            }
        },
        /**
         * 点击切换至路径搜索
         */
        onChange2Path: function () {
            domClass.add(this.domNode, "hidden");
            this.changeMethod && this.changeMethod();
        },

        _clear2Change: function () {
            domClass.remove(this["changeIcon"], "hidden");
            domClass.add(this["clearIcon"], "hidden");
        },

        _change2Clear: function () {
            domClass.add(this["changeIcon"], "hidden");
            domClass.remove(this["clearIcon"], "hidden");
        },

        keypressHandler: function(e) {
            if (e.keyCode === 13) {
                this.searchKeyZone();
            }
        },

        /**
         * 点击搜索按钮执行的方法
         */
        searchKeyZone: function () {
            var words = this.cnameNode.value;
            if (words === "" || words == null) {
                alert("请输入地址");
            } else {
                domClass.add(this["closeBtnNode"], "hidden");
                this._change2Clear();
                var cityCode = this.zoneSelect.getValue();
                var data = {
                    words: words,
                    citycode: cityCode,
                    num: 20/*默认获取兴趣地址的条数*/
                };
                this._agsFacade.getInterestPlaceData(this.agsUrl, data, function (resp) {
                    if (resp.code === "1000") {
                        this.addressList = resp.detail;
                        domClass.remove(this["pageContainerNode"], "hidden");
                        if (this.addressList.length <= this._defaultValue) {    //当返回数量少于默认展示数量时隐藏上一页、下一页按钮
                            domClass.add(this["pageContainerNode"], "hidden");
                        }
                        domClass.add(this["preButton"], "button-disabled");//当是第一页时 上一页按钮禁用
                        this.addressHandle(this.addressList);
                    } else {
                        alert(resp.info);
                    }
                }.bind(this), function (err) {
                    console.log(err);
                });
            }
        },
        /**
         * 点击定位
         * @param e
         */
        zoneListClick: function (e) {
            e = e ? e : window.event;
            var target = e.target || e.srcElement;
            var index = target.getAttribute("index") - 1;

            if (this.locationGraphic) {    //添加不同的图标来区分当前定位的位置
                this.locationGraphic.symbol = this._imageSymbol;
            }
            this.locationGraphic = this.graphics[index];
            this.locationGraphic.symbol = this._locationImageSymbol;
            var geo = this.locationGraphic.feature.geometry;
            this.view.centerAt(geo.x, geo.y);
        },
        /**
         * 上一页
         */
        prevPage: function () {
            if (this._currentPage > 1) {
                this._currentPage--;
                this.addressHandle(this.addressList);
                if (this._currentPage < this._defaultValue - 1) {
                    domClass.remove(this["nextButton"], "button-disabled");//下一页按钮启用
                }
                if (this._currentPage === 1) {
                    domClass.add(this["preButton"], "button-disabled");//上一页按钮禁用
                }

            }
        },
        /**
         * 下一页
         */
        nextPage: function () {
            if (this._currentPage < this._defaultValue - 1) {
                this._currentPage++;
                if (this._currentPage === 2) {
                    domClass.remove(this["preButton"], "button-disabled");//上一页按钮启用
                }
                this.addressHandle(this.addressList);
                if (this._currentPage === this._defaultValue - 1) {
                    domClass.add(this["nextButton"], "button-disabled");//当是最后一页时 下一页按钮禁用
                }
            }
        },
        /**
         * 兴趣地址渲染
         * @param addressList
         */
        addressHandle: function (addressList) {/*渲染兴趣地址*/
            this.zoneListNode.innerHTML = "";
            if (addressList == null) return;
            var index = 0;
            var len = this._currentPage * this._defaultValue > addressList.length ? addressList.length : this._currentPage * this._defaultValue
            var centerPointList = [];
            for (var i = (this._currentPage - 1) * this._defaultValue; i < len; i++) {
                index = index + 1;
                var address = addressList[i].address;
                var centerPoint = addressList[i].centerPoint;
                centerPointList.push(centerPoint);
                var name = addressList[i].name;
                // var point = JSON.stringify(addressList[i]);
                var li = document.createElement("li");
                li.setAttribute("index", index);
                domStyle.set(li, "cursor", "pointer");
                var zoneIcon = document.createElement("strong");
                zoneIcon.className = "zoneIcon";
                zoneIcon.innerHTML = index;
                zoneIcon.setAttribute("index", index);

                var span = document.createElement("span");
                span.innerHTML = name;
                span.setAttribute("index", index);

                var p = document.createElement("p");
                p.innerHTML = address;
                p.setAttribute("index", index);

                li.appendChild(zoneIcon);
                li.appendChild(span);
                li.appendChild(p);
                this.zoneListNode.appendChild(li);
            }
            this.addIcon2Map(centerPointList);
        },
        /**
         * 添加标识到地图中
         * @param list
         */
        addIcon2Map: function (list) {
            if (!this.drawLayer) {
                this.drawLayer = this.view.map.findLayerById("drawLayer");
            }
            this.graphics = [];
            this.drawLayer.clear();
            var extent = this.getMapExtent(list);
            list.forEach(function (item) {
                var aPoint = this.wktGeometryFormater.toGeometry(item);
                var feature = new Feature({
                    attribute: null,
                    geometry: aPoint
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this._imageSymbol
                });
                this.graphics.push(graphic);
                this.drawLayer.addGraphic(graphic);
            }.bind(this));
            this.view.setExtent(extent);
        },
        /**
         * 获取地图的范围
         * @param list
         * @returns {exports}
         */
        getMapExtent: function (list) {
            var xList = [], yList = [];
            for (var i = 0; i < list.length; i++) {
                var listElement = list[i];
                var aPoint = this.wktGeometryFormater.toGeometry(listElement);
                xList.push(aPoint.x);
                yList.push(aPoint.y);
            }
            var minx = 0, miny = 0, maxx = 0, maxy = 0;
            minx = Math.min.apply(null, xList);
            maxx = Math.max.apply(null, xList);
            miny = Math.min.apply(null, yList);
            maxy = Math.max.apply(null, yList);
            return new Extent(minx, miny, maxx, maxy);
        },
        /**
         * 关闭搜索
         */
        closeSearch: function () {
            if (!this.drawLayer) {
                this.drawLayer = this.view.map.findLayerById("drawLayer");
            }
            this.graphics = [];
            this.drawLayer.clear();
            this._clear2Change();
            this.locationGraphic = null;
            domClass.add(this.pageContainerNode, "hidden");
            this.zoneListNode.innerHTML = "";
            domClass.add(this.closeBtnNode, "hidden");
            this.cnameNode.value = "";
        }
    });
});