define("com/huayun/webgis/action/SelectZoom", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "../geometry/Extent",
    "./ActiveMapAction"
], function (declare, on, topic, domConstruct, Extent, ActiveMapAction) {
    return declare("com.huayun.webgis.action.SelectZoom", [ActiveMapAction], {
        _mouseDown: null,       //鼠标按下事件
        _mouseUp: null,         //鼠标弹起事件
        _mouseMove: null,       //鼠标移动事件
        drawLayer: null,
        startPoint: {},   //拖拽起始点
        endPoint: {},     //拖拽结束点
        state: false,
        flag: false,//拖拽是否开启
        canvas: null,//选择区域绘制画布
        canvasId:"selectZoomCanvas",
        canvasShow:false,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.map = params.map;
            this.isActive = true;//
            this.drawLayer = this.map.findLayerById("drawLayer");
            console.log(this.drawLayer)
            this._mouseDown = null;
            this._mouseUp = null;
            this._mouseMove = null;
        },
        active: function () {
            console.log("active",this);
            if (!this.state) {    //当前Action处于未激活状态下的时候，激活该Action
                this.state = true;
                this._mouseDown = on(this.map.domNode, "mousedown", this._onMouseDown.bind(this));
                this._mouseUp = on(this.map.domNode, "mouseup", this._onMouseUp.bind(this));
            }
        },

        addCanvas: function () {
            console.log(this.canvas,!this.canvas)
            if (!this.canvas) {
                //画布不存在,添加新canvas画布
                var _canvas = document.createElement("canvas");
                _canvas.setAttribute("data-dojo-attach-event","onmousewheel:_zoomMap")
                console.log(this.map, this.map.domNode)
                _canvas.width = this.map.realWidth;
                _canvas.height = this.map.realHeight;
                _canvas.style = "position:absolute;top:0;right:0;cursor:crosshair;";
                this.canvas = _canvas;
                this.ctx = _canvas.getContext("2d");
                this.map.domNode.appendChild(_canvas);
            } else {
                //显示画布
                this.canvas.style.display = "block";
                console.log("showCanvas",this.canvas.style.display);

            }
            this.canvasShow = true;
        },

        removeCanvas: function () {
            this.canvas.style.display = "none";
            this.map.domNode.style = "cursor: pointer;"
            this.canvasShow = false;
        },

        _onMouseDown: function (e) {
            event.preventDefault();
            event.stopPropagation();
            console.log("_onMouseDown")
            this.addCanvas();
            this.selectStart(e);//开始选择
            this.doAction();
        },//鼠标按下开始绘制选择区域

        _onMouseUp: function (e) {
            console.log("_onMouseUp")
            event.preventDefault();
            event.stopPropagation();
            this.selectEnd(e);//结束选择
            this.map.panAble = true;
            this.removeCanvas();
            this._mouseMove.remove();
            this.invalid();
        },

        _onMouseMove: function (e) {
            console.log("_onMouseMove")
            event.preventDefault();
            event.stopPropagation();
            if (this.startPoint) {//绘制选择的区域矩形框ctx, canvas, startPoint, e)
                this.drawRect(this.ctx, this.canvas, this.startPoint, e);
            }
        },
        invalid: function () {
            this._endDrawMethod();
            this.endActionMethod.call();
        },
        doAction: function () {
            this._mouseMove = on(this.map.domNode, "mousemove", this._onMouseMove.bind(this));
        },

        selectStart: function (e) {
            //开始选择状态
            this.flag = !this.flag;//开启选择
            this.map.panAble = false; // 禁止平移
            this.startPoint.x = e.offsetX;
            this.startPoint.y = e.offsetY;
        },

        selectEnd: function (e) {
            //结束选择状态
            this.endPoint.x = e.offsetX;
            this.endPoint.y = e.offsetY;
            //计算框选的地图范围
            var selectedExtent = this.getSelectedExtend(this.startPoint, this.endPoint, this.canvas, this.map)
            this.map.setExtent(selectedExtent);//设置地图范围
            topic.publish("setEagleEyeExtent", this.map.extent);//鹰眼地图范围更新
            this.startPoint = {};//清空起始点
            this.endPoint = {};
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawRect: function (ctx, canvas, startPoint, e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(startPoint.x, startPoint.y, e.offsetX - startPoint.x, e.offsetY - startPoint.y);
        },

        getSelectedExtend: function (p1, p2, canvas, map) {//计算选择矩形的范围
            var leftTopPoint = {x: 0, y: 0};
            var rightBottomPoint = {x: canvas.width, y: canvas.height};
            leftTopPoint.x = p1.x < p2.x ? p1.x : p2.x;//取x小的
            leftTopPoint.y = p1.y < p2.y ? p1.y : p2.y;
            rightBottomPoint.x = p1.x > p2.x ? p1.x : p2.x;//取x大的
            rightBottomPoint.y = p1.y > p2.y ? p1.y : p2.y;
            var perX = (map.extent.maxx - map.extent.minx) / canvas.width;//需要重新计算每个px代表的地理范围
            var perY = (map.extent.maxy - map.extent.miny) / canvas.height;
            // console.log(p1, p2, leftTopPoint, rightBottomPoint, canvas.width, canvas.height, perX, perY)
            var _newExtent = new Extent(map.extent.minx + p1.x * perX,
                map.extent.maxy - p1.y * perY,
                map.extent.minx + p2.x * perX,
                map.extent.maxy - p2.y * perY);
            // console.log(_newExtent)
            return _newExtent;
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