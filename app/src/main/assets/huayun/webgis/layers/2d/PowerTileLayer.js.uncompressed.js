/**
 * Created by DELL on 2017/11/21.
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.PowerTileLayer
 */
define("com/huayun/webgis/layers/2d/PowerTileLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "./FlatLayer",
    "../../geometry/Extent",
    "../../geometry/MapPoint",
    "../../geometry/Point",
    "../../request",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/when"
], function (declare,topic,Layer,Extent,MapPoint,Point,request,domStyle,dom,when) {
    /**
     * @alias com.huayun.webgis.layers.2d.PowerTileLayer
     * @extends {Layer}
     * @property {string}  url  - 地址
     * @property {null}  image  - 图片
     * @property {Array}  nowextent  - 现在的视图范围
     */
    return declare("com.huayun.webgis.layers.2d.PowerTileLayer",[Layer],{
        url: null,
        image: null,
        nowextent: null,
        ctx:null,
        loadPromise:null,

        constructor: function (params) {
            this.url = params.url;
            this.id = params.id;
            this.visible = params.visible?params.visible:true;
            //this.zindex = params.zindex?params.zindex:5;
            this.map = params.map;
            this.oldcanvas = document.createElement("canvas");//离屏canvas,动画时使用
            this.oldcanvas.width = this.map.width;
            this.oldcanvas.height = this.map.height;
            this.oldctx = this.oldcanvas.getContext("2d");
            this.oldctx.imageSmoothingEnabled = false;
            var obj = this;
            topic.subscribe("stopPan",function () {
                obj.load();
            });
            topic.subscribe("mapPan",function (xmove,ymove) {
                obj.refresh(xmove,ymove);
            });
            topic.subscribe("resizeEnd",function () {
                obj.load();
            });
        },
        /**
         * 画布创建
         */
        postCreate: function () {
            this.inherited(arguments);
            this.ctx = this.canvasNode.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;
        },
        /**
         * 刷新
         * @param xmove 
         * @param ymove 
         */
        refresh: function (xmove,ymove) {
            domStyle.set(this.domNode,"left",this.map.moveX+"px");
            domStyle.set(this.domNode,"top",this.map.moveY+"px");
            this.ctx.translate(xmove,ymove);
        },
        /**
         * 加载
         */
        load: function () {
            this.fetch();
            this.render();
        },
        /**
         * 获取
         */
        fetch: function () {
            var extent = this.map.extent,
                width=this.map.width,
                height = this.map.height,
                url = this.url + "&bbox="+extent.minx+","+extent.miny+","+extent.maxx+","+extent.maxy+"&size="+width+","+height+"&access_token=20b006ac-917d-49e6-a71e-99d2e2dbfe10";
            this.loadPromise = this.fetchTile(url);
        },
        /**
         * 渲染
         */
        render: function () {
            var ctx = this.ctx,
                canvas = this.canvasNode,
                obj = this,
                map = this.map,
                pmovex=map.moveX,
                pmovey=map.moveY,
                zoomCount = map.zoomCount,
                width = map.width,
                height = map.height;
            this.nowextent=map.extent;
            (function (zoomCount,pmovex,pmovey) {
                obj.loadPromise.then(function (resp) {
                    var image = resp.data;
                    /*if (zoomCount != 0){
                        ctx.restore();
                    }*/
                    if (obj.map.zoomCount === zoomCount && pmovex == obj.map.moveX && pmovey == obj.map.moveY){
                        obj.image = image;
                        canvas.width = width;
                        canvas.height = height;
                        domStyle.set(obj.domNode,"left","0px");
                        domStyle.set(obj.domNode,"top","0px");
                        obj.map.moveX =0;
                        obj.map.moveY=0;
                        ctx.drawImage(image,0,0,width,height);
                        obj.oldctx.clearRect(0,0,width,height);
                        obj.oldctx.drawImage(image,0,0,width,height);
                        obj.map.zoomCount = 0;
                    }
                });
            })(zoomCount,pmovex,pmovey);

            /*promise = this.fetchTile,
                zoomCount = this.map.zoomCount,
                ctx = this.ctx;
            var canvas = this.canvasNode;
            var obj = this;
            var map = this.map;
            var pmovex=map.moveX,pmovey=map.moveY;
            this.nowextent=extent;
            (function (zoomCount,pmovex,pmovey) {
                when(promise(url),function (image) {
                    if (zoomCount != 0){
                        ctx.restore();
                    }
                    if (obj.map.zoomCount === zoomCount && pmovex == obj.map.moveX && pmovey == obj.map.moveY){
                        obj.image = image;
                        canvas.width = width;
                        canvas.height = height;
                        domStyle.set(obj.domNode,"left","0px");
                        domStyle.set(obj.domNode,"top","0px");
                        obj.map.moveX =0;
                        obj.map.moveY=0;
                        ctx.drawImage(image,0,0,width,height);
                        obj.map.zoomCount = 0;
                    }
                });
            })(zoomCount,pmovex,pmovey);*/
        },
        /**
         * 获取切片
         * @param url 
         */
        fetchTile: function(url) {
            return request(url,{responseType:"image",allowImageDataAccess:false});
        },
        /*zoomIn: function (x,y) {
            this.ctx.save();
            this.fetch();
            var times = 5,obj = this;
            setTimeout(function () {
                obj.animateZoomIn(obj,times,x,y);
            },30);
        },*/
        /**
         * 缩放开始
         */
        zoomStart: function () {
            this.ctx.save();
            this.fetch();
        },
        /**
         * 放大
         * @param x 
         * @param y 
         */
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
            //this.image = this.ctx.getImageData(0,0,this.map.width,this.map.height);
            this.oldctx.clearRect(0,0,this.map.width,this.map.height);
            this.oldctx.drawImage(this.canvasNode,0,0);
            this.ctx.restore();
            this.render();
        },
        /**
         * 缩小
         * @param x 
         * @param y 
         */
        zoomOut: function (x,y) {
            this.ctx.clearRect(0,0,this.map.width,this.map.height);
            this.ctx.translate(x*0.12945,y*0.12945);
            this.ctx.scale(0.87055,0.87055);
            this.ctx.drawImage(this.oldcanvas,0,0);
        },
        /*zoomOut: function (x,y) {
            this.ctx.save();
            this.fetch();
            var times = 5,obj = this;
            setTimeout(function () {
                obj.animateZoomOut(obj,times,x,y);
            },30);
        },
        animateZoomOut: function (obj,times,x,y) {
            if (times>0){
                obj.ctx.clearRect(0,0,obj.map.width,obj.map.height);
                obj.ctx.translate(x*0.12945,y*0.12945);
                obj.ctx.scale(0.87055,0.87055);
                obj.ctx.drawImage(obj.image,0,0);
                times--;
                setTimeout(function () {
                    obj.animateZoomOut(obj,times,x,y);
                },30)
            }else{
                obj.render();
            }
        }*/
        rotateStart: function () {
            /*this.oldcanvas.width = this.map.width;
            this.oldcanvas.height = this.map.height;
            this.oldctx.drawImage(this.canvasNode,0,0);*/
        },
        rotate: function () {
            /*this.ctx.clearRect(0,0,this.map.width,this.map.height);
            this.ctx.translate(this.map.width/2, this.map.height/2);
            this.ctx.rotate(5*Math.PI/180);
            this.ctx.translate(-this.map.width/2, -this.map.height/2);
            this.ctx.drawImage(this.oldcanvas,0,0);*/
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
    })
});