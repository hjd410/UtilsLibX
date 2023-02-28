define("com/huayun/webgis/action/selectZoom/SelectZoomOut", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "../../geometry/Extent",
    "../ActiveMapAction"
], function (declare, on, topic, domConstruct, Extent, ActiveMapAction) {
    return declare("com.huayun.webgis.action.SelectZoom.SelectZoomOut", [ActiveMapAction], {
        _mouseDown: null,       //鼠标按下事件
        _mouseUp: null,         //鼠标弹起事件
        _mouseMove: null,       //鼠标移动事件
        drawLayer: null,
        startPoint: null,   //拖拽起始点
        endPoint: {},     //拖拽结束点
        state: false,
        flag: false,//拖拽是否开启
        canvas: null,//选择区域绘制画布
        canvasId: "selectZoomCanvas",
        canvasShow: false,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.view = params.view;
            this.map = this.view.map;
            this.isActive = true;//
            this.drawLayer = this.map.findLayerById("drawLayer");
            this._mouseDown = null;
            this._mouseUp = null;
            this._mouseMove = null;
        },
        active: function () {
            if (!this.state) {    //当前Action处于未激活状态下的时候，激活该Action
                this.state = true;
                this.view.panEnabled = false; // 禁止平移
                this._mouseDown = on(this.view.domNode, "mousedown", this._onMouseDown.bind(this));
                this._mouseUp = on(this.view.domNode, "mouseup", this._onMouseUp.bind(this));
            }
        },
        /**
         * 添加画布
         * @private
         */
        addCanvas: function () {
            // console.log(this.canvas, !this.canvas)
            if (!this.canvas) {
                //画布不存在,添加新canvas画布
                var _canvas = document.createElement("canvas");
                _canvas.width = this.view.width;
                _canvas.height = this.view.height;
                _canvas.style = "position:absolute;top:0;right:0;cursor:crosshair;";
                this.canvas = _canvas;
                this.ctx = _canvas.getContext("2d");
                this.view.domNode.appendChild(_canvas);
            } else {
                //显示画布
                this.canvas.style.display = "block";
            }
            this.canvasShow = true;
        },
        /**
         * 移除画布
         * @private
         */
        removeCanvas: function () {
            this.canvas.style.display = "none";
            this.view.domNode.style = "cursor: pointer;"
            this.canvasShow = false;
        },
        /**
         * 鼠标按下开始绘制选择区域
         * @param e 
         * @private
         */
        _onMouseDown: function (e) {
            event.preventDefault();
            event.stopPropagation();
            this.startPoint = {};
            this.addCanvas();
            this.selectStart(e);//开始选择
            this.doAction();
        },//鼠标按下开始绘制选择区域
        /**
         * 鼠标弹起结束选择区域
         * @param e 
         * @private
         */
        _onMouseUp: function (e) {
            event.preventDefault();
            event.stopPropagation();
            this.selectEnd(e);//结束选择
            this.removeCanvas();
            this._mouseMove.remove();
        },
        /**
         * 鼠标移动，确定选择区域
         * @param e 
         * @private
         */
        _onMouseMove: function (e) {
            event.preventDefault();
            event.stopPropagation();
            if (this.startPoint) {//绘制选择的区域矩形框ctx, canvas, startPoint, e)
                this.drawRect(this.ctx, this.canvas, this.startPoint, e);
            }
        },

        invalid: function () {
            this._endDrawMethod();
            // this.endActionMethod.call();
        },

        doAction: function () {
            this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
        },
        /**
         * 开始选择
         * @param e 
         * @private
         */
        selectStart: function (e) {
            //开始选择状态
            this.flag = !this.flag;//开启选择
            this.startPoint.x = e.offsetX;
            this.startPoint.y = e.offsetY;
        },
        /**
         * 结束选择
         * @param e 
         * @private
         */
        selectEnd: function (e) {
            //结束选择状态
            this.endPoint.x = e.offsetX;
            this.endPoint.y = e.offsetY;
            //计算框选的地图范围
            var selectedExtent = this.getSelectedExtend(this.startPoint, this.endPoint, this.canvas);
            this.view.setExtent(this.getNewMapExtent(selectedExtent));//设置地图范围

            this.startPoint = null;//清空起始点
            this.endPoint = {};
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        /**
         * 绘制矩形
         * @param ctx 
         * @param canvas 
         * @param startPoint  选择开始点
         * @param e 
         */
        drawRect: function (ctx, canvas, startPoint, e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(startPoint.x, startPoint.y, e.offsetX - startPoint.x, e.offsetY - startPoint.y);
        },
        /**
         * 得到选择的区域，并将其缩小
         * @param p1   开始点
         * @param p2   结束点
         * @param canvas 
         * @private
         */
        getSelectedExtend: function (p1, p2, canvas) {//计算选择矩形的范围
            var x1 = p1.x,
                x2 = p2.x,
                y1 = p1.y,
                y2 = p2.y;
            var bound = this.view.calcBounds(Math.min(x1, x2), Math.max(x1, x2), Math.min(y1, y2), Math.max(y1, y2));
            var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
            return new Extent(xmin, ymin, xmax, ymax);
        },
        /**
         * 框选得到的地图范围
         * @param selectExtent 
         */
        getNewMapExtent: function (selectExtent) {
            //计算新的地图范围
            var newExtent = selectExtent,//框选区域的地图范围
                view = this.view,
                extent = view.getExtent();
            var factor = (extent.getWidth() / selectExtent.getWidth() + extent.getHeight() / selectExtent.getHeight()) / 2; //比例系数
            var centerMapPoint = newExtent.getCenter(); //选择地图范围的中心点
            var newWidth = extent.getWidth() * factor;
            var newHeight = extent.getHeight() * factor;
            var minx = centerMapPoint.x - newWidth / 2;
            var miny = centerMapPoint.y - newHeight / 2;
            var maxx = centerMapPoint.x + newWidth / 2;
            var maxy = centerMapPoint.y + newHeight / 2;
            var return_extent = new Extent(minx, miny, maxx, maxy);
            return return_extent;
        },
        _endDrawMethod: function () {
            this.state = false;
            if (this._mouseDown) {
                this._mouseDown.remove();
                this._mouseDown = null;
            }
            if (this._mouseUp) {
                this._mouseUp.remove();
                this._mouseUp = null;
            }
            if (this._mouseMove) {
                this._mouseMove.remove();
                this._mouseMove = null;
            }
        }
    });
});