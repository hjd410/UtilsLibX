/*
/!**
 * Created by overfly on 2018/1/30.
 *!/
define("com/huayun/webgis/widget/Zoom", ["dojo/_base/declare","dojo/dom","dojo/on","dojo/dom-class"],function (declare,dom,on,domClass) {
    return declare("com.huayun.webgis.widget.Zoom",[],{
        map:null,

        constructor:function (map) {
            this.map = map;
            var backinit = document.createElement("div");
            var container = this.map.container;
            domClass.add(backinit,"webgis-backinit");
            backinit.innerHTML = "i";
            on(backinit,"click",function (e) {
                e.preventDefault();
                e.stopPropagation();
                map.extent = map.initExtent;
                map.initBack(map);
            });
            container.appendChild(backinit);
            var mbt = document.createElement("div");
            domClass.add(mbt,"webgis-plus");
            mbt.innerHTML = "+";
            on(mbt,"click",function (e) {
                e.preventDefault();
                e.stopPropagation();
                map.zoomInCenter();
            });
            container.appendChild(mbt);
            var sbt = document.createElement("div");
            domClass.add(sbt,"webgis-minus");
            sbt.innerHTML = "-";
            container.appendChild(sbt);
            on(sbt,"click",function (e) {
                e.preventDefault();
                e.stopPropagation();
                //map.shrink(map);
                map.zoomOutCenter();
            });
            on(map.root,"mousewheel",function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e["wheelDelta"]>0){
                    map.zoomIn(e.x,e.y);
                    //map.magnifyPo(map,e.x,e.y);
                }else if (e["wheelDelta"]<0){
                    //map.shrinkPo(map,e.x,e.y);
                    map.zoomOut(e.x,e.y);
                }
            });
        }
    });
});*/
