require({cache:{
'url:com/huayun/webgis/templates/bookMark.html':"<div class=\"${baseClass}\" id=\"bookMark\" style=\"pointer-events: all\">\r\n    <button class=\"book-mark-btn\" id=\"addBtn\" data-dojo-attach-event=\"onclick:viewBook\"></button>\r\n    <div class=\"bookMarkView\" id=\"bookMarkView\" style=\"display: none\">\r\n        <div class=\"book-mark-left\">\r\n            <span class=\"bookNameTip\">添加书签:</span>\r\n            <input class=\"bookMarkName\" type=\"text\" name=\"bookMarkName\" id=\"bookMarkName\" placeholder=\"请输入保存的书签名\"/>\r\n            <button id=\"saveBookMark\" class=\"saveBookBtn\" data-dojo-attach-event=\"onclick:saveBook\">保存书签</button>\r\n        </div>\r\n        <div class=\"book-mark-right\">\r\n            <span class=\"bookNameTip\">书签清单:</span>\r\n            <div id=\"bookMarkShow\">\r\n                <ul class=\"bookMarks\" id=\"bookMarkList\" data-dojo-attach-event=\"onclick:selectBook\"></ul>\r\n            </div>\r\n        </div>\r\n        <button id=\"closeBookBtn\" class=\"closeBookBtn\" data-dojo-attach-event=\"onclick:closeBook\">关闭书签</button>\r\n    </div>\r\n</div>\r\n"}});
/**
 * @author:xiaolei
 * @date:2020/4/15
 */
define(
    "com/huayun/webgis/widget/BookMark", [
        "dojo/_base/declare",
        "dojo/dom-style",
        "dojo/topic",
        "dojo/dom",
        "dojo/dom-construct",
        // "dojo/com/huayun/webgis/layers/TileLayer",
        // "com/huayun/framework/ModuleXContainer",
        // "com/huayun/webgis/views/SceneView",
        "./MapModuleX",
        "dojo/text!../templates/bookMark.html"
    ], function (declare, domStyle, topic, dom, domConstruct, MapModuleX, template) {
        return declare("com.huayun.webgis.widget.BookMark", [MapModuleX], {
            baseClass: "bookMark",
            templateString: template,
            view: null,
            map: null,
            markData: [],
            constructor: function () {
                this.view = null;
                this.layerView = null;
            },
            doInit: function () {
                this.map = this.get("map");
                this.view = this.get("view");
            },
            viewBook: function (e) {
                // var ev = e || window.event;
                // ev.stopPropagation();
                var books = document.getElementById("bookMarkView");
                books.style.display = "block";
                // this.drag();
                // 清除位置
                // var w = window.screen.width;
                // var h = window.screen.height;
                // books.style.left = -(w / 2) + 'px';
                // books.style.top = h / 2 + 'px';
            },
            // 添加书签
            // addBookMark: function () {
            //     var oDiv = document.getElementById("bookNameDiv");
            //     oDiv.style.display = "block";
            // },
            // 保存书签
            saveBook: function () {
                var nowState = this.view.viewpoint;
                // var nowState = this.view._initState;
                var oDiv = document.getElementById("bookMarkView");
                var bookName = document.getElementById("bookMarkName");
                var bookNameValue = bookName.value;
                this.markData.push({
                    label: bookNameValue,
                    pitch: nowState.pitch,
                    angle: nowState.angle,
                    level: nowState.level,
                    center: nowState.center
                });
                oDiv.style.display = "none";
                bookName.value = "";
                // 书签列表
                var bookList = document.getElementById("bookMarkList");
                bookList.innerHTML = "";
                for (var i = 0; i < this.markData.length; i++) {
                    var liItem = document.createElement("li");
                    liItem.innerHTML = this.markData[i].label;
                    liItem.className = "bookItem";
                    bookList.appendChild(liItem);
                }
                // console.log(this.view.viewpoint);
                // console.log(this.view._initState());
            },
            // 书签列表div显示/隐藏
            // bookMarkHide: function () {
            //     var bookMarkShow = document.getElementById("bookMarkShow");
            //     var bookList = document.getElementById("bookMarkList");
            //     bookList.innerHTML = "";
            //     bookMarkShow.style.display = "none";
            // },
            // // 查看书签
            // viewBook: function () {
            //     var bookMarkShow = document.getElementById("bookMarkShow");
            //     var bookList = document.getElementById("bookMarkList");
            //     for (var i = 0; i < this.markData.length; i++) {
            //         var liItem = document.createElement("li");
            //         liItem.innerHTML = this.markData[i].label;
            //         liItem.className = "bookItem";
            //         bookList.appendChild(liItem);
            //     }
            //     bookMarkShow.style.display = "block";
            //     // bookList.style.display = "block";
            // },
            // 选择书签
            selectBook: function (e) {
                e = e ? e : window.event;
                var target = e.target || e.srcElement;
                var selectBookName = target.innerHTML;
                this.selectBookMark(selectBookName);
                var bookList = document.getElementById("bookMarkList");
                var bookMarkShow = document.getElementById("bookMarkView");
                bookMarkShow.style.display = "none";
                // bookList.innerHTML = "";
            },
            // // 点击获取对应书签下的数据，并加载返回对应位置的状态
            selectBookMark: function (bookName) {
                var viewState = {},
                    stateItem = {};
                // 准备数据
                this.markData.forEach(function (currentValue) {
                    if (currentValue.label === bookName) {
                        stateItem = currentValue;
                        console.log(stateItem)
                    }
                })
                // 开始绘制
                if (stateItem) {
                    viewState.pitch = stateItem.pitch;
                    viewState.angle = stateItem.angle;
                    viewState.level = stateItem.level;
                    viewState.center = stateItem.center;
                    this.view.setView(viewState);
                }
            },
            // 关闭书签
            closeBook: function () {
                var books = document.getElementById("bookMarkView");
                books.style.display = "none";
            },
            // div移动拖拽
            drag: function () {
                var drag = document.getElementById("bookMarkView");
                drag.onmousedown = function (e) {
                    var e = e || window.event;
                    var diffX = e.clientX - drag.offsetLeft;
                    var diffY = e.clientY - drag.offsetTop;
                    document.onmousemove = function (ev) {
                        var oEvent = ev || window.event;
                        var left = oEvent.clientX - diffX;
                        var top = oEvent.clientY - diffY;
                        var maxWidth = window.innerWidth - drag.offsetWidth + 250;
                        var maxHeight = window.innerHeight - drag.offsetHeight + 250;
                        if (left < 0) {
                            left = 250
                        } else if (left > maxWidth) {
                            left = maxWidth;
                        }
                        if (top < 0) {
                            top = 250
                        } else if (top > maxHeight) {
                            top = maxHeight
                        }
                        drag.style.left = left + 'px';
                        drag.style.top = top + 'px';
                    }
                    document.onmouseup = function (ev) {
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                    return false;
                }
            }
        });
    }
);
