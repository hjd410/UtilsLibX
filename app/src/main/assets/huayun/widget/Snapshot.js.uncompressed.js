/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/28
 *  @time   :   15:46
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/widget/Snapshot", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-style",
        "./ModuleX"
    ], function (declare, domConstruct, domStyle, ModuleX) {
        return declare("com.huayun.framework.widget.Snapshot", [ModuleX], {

            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "pointer-events", "all");
            },

            doInit: function () {
                console.log("Snapshot");
                domConstruct.create("div", {
                    id: "snapshotBtn",
                    innerHTML: "Snapshot",
                    onclick: this._onClickHandler.bind(this)
                }, this.domNode);
            },

            _onClickHandler: function () {
/*                var map = this.context.lookUp("simpleMapModule3D").map;
                console.log(map.layerContainer.layers);
                var canvasNode = map.layerContainer.layers[4].canvas;//document.getElementsByTagName("canvas")[0];
                // console.log(canvasNode);
                domStyle.set(canvasNode, "display", "none");
                console.log(canvasNode);
                canvasNode.toBlob(function (blob) {
                    console.log(blob);
                    saveAs(blob, "pretty image.png");
                }, "image/png");*/
                /*                var node = domConstruct.toDom("<img id='powerImg' style='position: fixed;top: 0px'/>");
                                node.src = canvasNode.toDataURL("image/png");
                                domConstruct.place(node, "hyMap");*/
            }
        });
    }
);