define(
    "com/huayun/webgis/action/Screenshot", [
        "dojo/_base/declare",
        "dojo/topic",
        "./MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.Screenshot", [MapAction], {
            view: null,
            canvas: null,
            constructor: function (params) {
                declare.safeMixin(params);
                this.view = params.view;
                // this.dataType = params.dataType;
            },
            doAction: function () {
                this.saveImage();
            },
            /**
             * 图片保存
             */
            saveImage: function () {
                var a = document.createElement("a");
                var event = new MouseEvent("click");
                a.download = "HY-Map.jpg";
                this.view.addTask(function () {
                    a.href = this.view._gl.canvas.toDataURL("image/png");
                    a.dispatchEvent(event);
                }.bind(this));
            }
        });
    }
);