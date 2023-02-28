/**
 * Created by DELL on 2017/11/21.
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.BaseTileLayer
 */
define("com/huayun/webgis/layers/2d/BaseTileLayer", [
    "dojo/_base/declare",
        "dojo/topic",
        "../../request",
        "./TileLayer",
        "../../geometry/Extent",
        "../../geometry/MapPoint",
        "../../geometry/Point",
        "../support/Tile",
        "dojo/dom-style",
        "dojo/when"],
    function (declare,topic,request,TileLayer,Extent,MapPoint,Point,Tile,domStyle,when) {
    /**
     * @alias com.huayun.webgis.layers.2d.BaseTileLayer
     * @extends {TileLayer}
     * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合 
     * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合
     * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合
     * @property {Array}  tileArray  - 切片数组
     * @property {Point}  screenPoint0  - 屏幕坐标
     * @property {Array}  needLoadIndex  - 待加载切片index的集合
     * @property {null}  loadPromise  - 加载
     * @property {number}  startCol  - 开始的列
     * @property {number}  startRow  - 开始的行
     * @property {string}  oldcanvasIsFull  - 旧的canvas
     */
    return declare("com.huayun.webgis.layers.2d.BaseTileLayer",[TileLayer],{
        lastIndexArray:[],
        currentIndexArray:[],
        needRemovedArrayOfTielIndex:[],
        tileArray:[],
        screenPoint0:null,
        needLoadIndex:[],
        loadPromise: null,
        startCol:0,
        startRow:0,
        ctx:null,
        oldcanvasIsFull:false,

        //flag:false,

        constructor: function (params) {
            this.id = params.id;
            this.visible = params.visible?params.visible:true;
            //this.dataReady = false;
            //this.waittingRender = true;
            this.map = params.map;
            this.url = params.url;
            this.tileInfo = params.tileInfo;
            this.width = params.width;
            this.height = params.height;
            this.fullExtent = this.tileInfo.fullExtent;
            //this.zindex = params.zindex?params.zindex:0;
            this.lastIndexArray = [];
            this.currentIndexArray = [];
            this.needRemovedArrayOfTielIndex = [];
            this.tileArray = [];
            this.needLoadIndex = [];
            this.startCol = 0;
            this.startRow = 0;
            this.oldcanvas = document.createElement("canvas");//离屏canvas,动画时使用
            this.oldcanvas.width = this.width;
            this.oldcanvas.height = this.height;
            this.oldctx = this.oldcanvas.getContext("2d");
            this.oldcanvasIsFull = false;
            this.loadPromise = new Object();
            this.oldctx.imageSmoothingEnabled = false;
            var obj = this;
            topic.subscribe("mapPan",function (xmove,ymove) {
                obj.load(xmove,ymove);
            });
            topic.subscribe("d3mapPan",function (xmove,ymove) {
                obj.load(xmove,ymove);
            });
            topic.subscribe("resizing",function () {
                obj.canvasNode.width = obj.map.width;
                obj.canvasNode.height = obj.map.height;
                obj.load();
            })
        },
        /**
         * 移动地图
         * @param xmove 
         * @param ymove 
         */
        mapMove: function (xmove,ymove) {
            this.load(xmove,ymove);
        },
        /**
         * 创建画笔
         */
        postCreate: function () {
            this.inherited(arguments);
            this.ctx = this.canvasNode.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;
        },
        /**
         * 获取图层结果
         * @param  level 
         */
        getResolution: function (level) {
            return this.tileInfo.lods[level].resolution;
        },

        load: function () {
            this.computeIndex();
            this.removeTiles();
            //this.dataReady = true;
            this.oldcanvasIsFull=false;
            this.fetchTiles();
            this.render();
        },
        /**
         * 计算切片序号
         */
        computeIndex:function () {
            var origin = this.tileInfo.origin,
                size = this.tileInfo.size,
                extent = this.map.extent,
                resolution = this.map.resolution,
                level = this.map.level,
                rs = resolution*size,mapPoint,position;
            var startCol = Math.floor((extent.minx - origin.x )/rs),
                startRow = Math.floor((origin.y - extent.maxy)/rs),
                endCol = Math.ceil((extent.maxx - origin.x )/rs),
                endRow = Math.ceil((origin.y - extent.miny)/rs);
            this.screenPoint0 = null;
            if(!this.screenPoint0){
                mapPoint = new MapPoint(startCol*rs+origin.x, origin.y-startRow*rs);
                position = this.map.geometryToPosition(mapPoint);
                this.screenPoint0 = this.map.positionToScreen(position);
            }
            //判断哪些缓存切片需要删除,重新加载
            this.currentIndexArray=[];
            this.needLoadIndex = [];
            var x,y,index,screenPoint,tile,i,j;
            this.startCol = startCol;
            this.startRow = startRow;
            for (i=startRow;i<endRow;i++){
                for(j=startCol;j<endCol;j++){
                    if (i>=0&&j>=0){
                        x = this.screenPoint0.x + (j-startCol)*size;
                        y = this.screenPoint0.y + (i-startRow)*size;
                        screenPoint = new Point(x,y);
                        index = level+"/"+j+"/"+i;
                        if (this.tileArray[index] == undefined || this.tileArray[index]==null){
                            this.needLoadIndex.push(index);
                            tile = new Tile(screenPoint);
                            this.tileArray[index]=tile;
                        }else{
                            this.tileArray[index].screenPoint=screenPoint;
                        }
                        this.currentIndexArray.push(index);
                    }
                }
            }
            //经过上面循环得到的needLoadIndex即为需要加载的index数组
            var isLast = false, isCurrent = false;
            var allIndex = this.lastIndexArray.concat(this.currentIndexArray);
            for (i=0;i<allIndex.length;i++){
                isLast = false;
                isCurrent =  false;
                for (j=0;j<this.lastIndexArray.length;j++){
                    if(allIndex[i] == this.lastIndexArray[j]) {
                        isLast = true;
                        break;
                    }
                }
                for (j=0;j<this.currentIndexArray.length;j++) {
                    if(allIndex[i] == this.currentIndexArray[j]) {
                        isCurrent = true;
                        break;
                    }
                }
                if(isLast&&!isCurrent){//待删除
                    this.needRemovedArrayOfTielIndex.push(allIndex[i]);
                }
            }
            this.lastIndexArray = this.currentIndexArray;
        },
        /**
         * 
         */
        removeTiles:function () {
            var index;
            for (var n=0;n<this.needRemovedArrayOfTielIndex.length;n++){
                index = this.needRemovedArrayOfTielIndex[n];
                delete this.tileArray[index];
            }
            this.needRemovedArrayOfTielIndex = [];
        },

        fetchTiles: function () {
            var  url = null,index,len = this.needLoadIndex.length;
            //加载需要请求的切片
            for (var p=0;p<len;p++){
                index = this.needLoadIndex[p];
                url = this.url+index;
                this.loadPromise[index] = this.fetchTile(url);
            }
        },
        /**
         * 渲染
         */
        render: function () {
            var tileCache = null,screenPoint, ctx = this.ctx,x,y;
            var obj = this, size = this.tileInfo.size, image;
            //先加载缓存中的切片
            for (var cache in this.tileArray){
                tileCache = this.tileArray[cache];
                if (tileCache.image){
                    screenPoint = tileCache.screenPoint;
                    ctx.drawImage(tileCache.image,screenPoint.x,screenPoint.y,size,size);
                }
            }
            var level,i,j,splits, count = 0;
            var needLength = this.needLoadIndex.length;
            if (needLength == 0){
                topic.publish("tileLayer",true);
            }
            for (var index in this.loadPromise){
                splits = index.split("/");
                level = splits[0]*1;
                j = splits[1]*1;
                i = splits[2]*1;
                (function (index,j,i) {
                    obj.loadPromise[index].then(function (resp) {
                        image = resp.data;
                        count++;
                        //重新计算请求切片的画图位置
                        x = obj.screenPoint0.x + (j-obj.startCol)*size;
                        y = obj.screenPoint0.y + (i-obj.startRow)*size;
                        screenPoint = new Point(x,y);
                        if (!obj.tileArray[index]){
                            ctx.drawImage(image,screenPoint.x,screenPoint.y,size,size);
                            var tileAdd = new Tile(screenPoint);
                            tileAdd.image = image;
                            obj.tileArray[index]=tileAdd;
                        }else{
                            if (image){
                                ctx.drawImage(image,screenPoint.x,screenPoint.y,size,size);
                                obj.tileArray[index].screenPoint = screenPoint;
                                obj.tileArray[index].image =image;
                            }
                        }
                        if (count == needLength){
                            topic.publish("tileLayer",true);
                        }
                        //console.timeEnd("loadedover");
                    },function (error) {
                        //console.log("error");
                    })
                })(index,j,i);
            }
        },
        /**
         * 缩放开始
         */
        zoomStart: function () {
            this.computeIndex();
            this.removeTiles();
            this.fetchTiles();
            this.ctx.save();
            if(!this.oldcanvasIsFull){
                this.oldcanvas.width = this.map.width;
                this.oldcanvas.height = this.map.height;
                this.oldctx.drawImage(this.canvasNode,0,0);
                this.oldcanvasIsFull = true;
            }
        },

        zoomIn: function (x,y) {
            this.ctx.clearRect(0,0,this.map.width,this.map.height);
            this.ctx.translate(-x*0.148698,-y*0.148698);
            this.ctx.scale(1.148698,1.148698);
            this.ctx.drawImage(this.oldcanvas,0,0);
        },
        /**
         * 缩放结束
         */
        zoomEnd: function () {
            this.ctx.restore();
            this.render();
            this.oldcanvasIsFull=false;
        },

        zoom3dStart: function () {
            this.computeIndex();
            this.removeTiles();
            this.fetchTiles();
            /*if(!this.oldcanvasIsFull){
                this.oldcanvas.width = this.map.width;
                this.oldcanvas.height = this.map.height;
                this.oldctx.drawImage(this.canvasNode,0,0);
                this.oldcanvasIsFull = true;
            }*/
        },

        zoom3dEnd: function () {
            this.render();
            //this.oldcanvasIsFull=false;
        },
        /*zoomOut: function (x,y) {
            this.computeIndex();
            this.removeTiles();
            this.fetchTiles();
            this.ctx.save();
            if(!this.oldcanvasIsFull){
                this.oldcanvas.width = this.map.width;
                this.oldcanvas.height = this.map.height;
                this.oldctx.drawImage(this.canvasNode,0,0);
                this.oldcanvasIsFull = true;
            }
            var times = 5,obj = this;
            setTimeout(function () {
                obj.animateZoomOut(obj,times,x,y);
            },30);
        },*/
        
        zoomOut: function (x,y) {
            this.ctx.clearRect(0,0,this.map.width,this.map.height);
            this.ctx.translate(x*0.12945,y*0.12945);
            this.ctx.scale(0.87055,0.87055);
            this.ctx.drawImage(this.oldcanvas,0,0);
        },
        /*animateZoomOut:function (obj,times,x,y) {
            if (times>0){
                obj.ctx.clearRect(0,0,obj.map.width,obj.map.height);
                obj.ctx.translate(x*0.12945,y*0.12945);
                obj.ctx.scale(0.87055,0.87055);
                obj.ctx.drawImage(obj.oldcanvas,0,0);
                times--;
                setTimeout(function () {
                    obj.animateZoomOut(obj,times,x,y);
                },30)
            }else{
                obj.ctx.restore();
                obj.render();
                obj.oldcanvasIsFull=false;
            }
        }*/

        rotateStart: function () {
            //this.oldcanvas.width = this.map.width;
            //this.oldcanvas.height = this.map.height;
            this.oldctx.drawImage(this.canvasNode,0,0);
        },
        
        rotate: function () {
            this.ctx.clearRect(0,0,this.map.width,this.map.height);
            this.ctx.translate(this.map.width/2, this.map.height/2);
            this.ctx.rotate(5*Math.PI/180);
            this.ctx.translate(-this.map.width/2, -this.map.height/2);
            this.ctx.drawImage(this.oldcanvas,0,0);
            /*
            * ctx.save();
            ctx.translate(325,325);
            ctx.rotate(45*Math.PI/180);
            ctx.translate(-25, -25);
            ctx.beginPath();
            ctx.rect(0,0,50,50);
            ctx.stroke();
            ctx.restore();
            * */
        }
    });

});