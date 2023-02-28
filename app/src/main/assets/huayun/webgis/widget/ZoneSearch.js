//>>built
require({cache:{"url:com/huayun/webgis/templates/zoneSearch.html":"<div data-dojo-attach-point =\"pathContainerNode\">\r\n    <div class=\"searchTop\">\r\n        <span class=\"titleIcon\">位置搜索</span>\r\n        <button class=\"closeIcon\" data-dojo-attach-event=\"onclick:closeSearchDialog\"></button>\r\n    </div>\r\n    <div class=\"navs\">\r\n        <span class=\"tabGap\"></span>\r\n        <span class=\"tabBtn myselect\" data-dojo-attach-point =\"seaBtnNode\" data-dojo-attach-event=\"onclick:selectSeaTab\">搜索</span>\r\n        <span class=\"tabBtn\" data-dojo-attach-point=\"pathBtnNode\" data-dojo-attach-event=\"onclick:selectPathTab\">路径</span>\r\n    </div>\r\n    <div class=\"tabBtmLine\"></div>\r\n    <div data-dojo-type=\"dijit/layout/ContentPane\" class=\"tabContainer\" data-dojo-attach-point=\"seaTabNode\" style=\"height: 580px;width:400px;\">\r\n        <div class=\"typeBtn\">\r\n            <div data-dojo-attach-point=\"zoneSelect\" style=\"display: inline-block;\"></div>\r\n            <input type=\"text\" data-dojo-attach-point=\"cnameNode\" data-dojo-attach-event=\"onclick:focusHandle\" class=\"cname\"/>\r\n            <button  class=\"searchBtn\" data-dojo-attach-event=\"onclick:searchKeyZone\">搜索</button>\r\n        </div>\r\n        <div class=\"zoneContainer\">\r\n            <ul data-dojo-attach-point=\"zoneListNode\" data-dojo-attach-event=\"onclick:zoneListClick\"></ul>\r\n            <div class=\"pageBtn hidden\" data-dojo-attach-point =\"pageContainerNode\">\r\n                <button data-dojo-attach-event=\"onclick:prevPage\" class=\"prePage\"></button>\r\n                <button data-dojo-attach-event=\"onclick:nextPage\" class=\"nextPage\"></button>\r\n            </div>\r\n        </div>\r\n    </div><!--应用模块结束-->\r\n    <div data-dojo-type=\"dijit/layout/ContentPane\" class=\"tabContainer hidden\" data-dojo-attach-point=\"pathTabNode\" style=\"height: 580px;width:400px;\">\r\n        <div class=\"costWrap\">\r\n            <span class=\"changeBtn\" data-dojo-attach-event=\"onclick:changeCost\"></span>\r\n            <div class=\"tabCenter\">\r\n                <div>\r\n                    <input type=\"text\" class=\"cname startVal\" data-dojo-attach-point=\"startZoneNode\" data-dojo-attach-event=\"onclick:focusHandle\"/>\r\n                    <span data-dojo-attach-event=\"onclick:getStartCost\"></span>\r\n                </div>\r\n                <hr style=\"width:100%;border-color:#eee;\"/>\r\n                <div>\r\n                    <input type=\"text\" class=\"cname endVal\"  data-dojo-attach-point=\"endZoneNode\" data-dojo-attach-event=\"onclick:focusHandle\"/>\r\n                    <span data-dojo-attach-event=\"onclick:getEndCost\"></span>\r\n                </div>\r\n            </div>\r\n            <button class=\"searchCost\" data-dojo-attach-event=\"onclick:searchPath\"></button>\r\n        </div>\r\n        <div class=\"pathTab\">\r\n            <div data-dojo-attach-point=\"totalCostNode\"   class=\"hidden total-cost\"></div>\r\n            <div data-dojo-attach-point=\"startCostNode\" class=\"hidden cost-title start-cost\"></div>\r\n            <table data-dojo-attach-point=\"costListNode\" class=\"costList hidden\"></table>\r\n            <table data-dojo-attach-point=\"addrListNode\" data-dojo-attach-event=\"onclick:getSelectCost\" class=\"costList hidden\"></table>\r\n            <div data-dojo-attach-point=\"endCostNode\" class=\"hidden cost-title end-cost\"></div>\r\n        </div>\r\n    </div><!--服务结束-->\r\n</div>\r\n"}});define("com/huayun/webgis/widget/ZoneSearch",["dojo/_base/declare","dojo/parser","dojo/topic","dijit/registry","dojo/dom-class","dojo/dom-style","dijit/form/Select","dojo/store/Memory","dojo/data/ObjectStore","com/huayun/facades/ConfigFacade","./MapModuleX","../geometry/MapPoint","../Feature","../Graphic","dojo/text!../templates/zoneSearch.html"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f){return _1("com.huayun.webgis.widget.ZoneSearch",[_b],{templateString:_f,url:"http://ags.prod.cloud.zj.sgcc.com.cn/",endPageNumber:5,startPageNumber:0,aplock:false,zoneNode:null,map:null,getZoneFlag:false,postCreate:function(){this.inherited(arguments);this.configFacade=new _a();zoneSelect=new _7({name:"zoneName",style:"width:100px;height: 28px;margin-left:2px;"},this.zoneSelect);zoneSelect.startup();this.configFacade.getZoneSelect(this.url+"ags/getCityCode",function(_10){if(_10.code==="1000"){var _11=_10.detail;var _12=new _8({idProperty:"cityCode",data:_11});var os=new _9({objectStore:_12,labelProperty:"name"});zoneSelect.setStore(os);}},function(err){});},doInit:function(){this.map=this.get("map");this.map._onClick=function(e){var _13=e.clientX,_14=e.clientY;var _15={x:_13,y:_14};var _16=this.map.screenToPosition(_15);var _17=this.map.positionToGeometry(_16);this.getCostNameByPoint(_17);}.bind(this);this.bindChange();},focusHandle:function(e){var e=e?e:window.event,_18=e.target;_18.focus();},closeSearchDialog:function(){var _19=this.context.lookUp("searchContainer");_19.hide();this.zoneInit();},hideCostContainer:function(){_5.add(this.costListNode,"hidden");_5.add(this.totalCostNode,"hidden");_5.add(this.startCostNode,"hidden");_5.add(this.endCostNode,"hidden");},showCostContainer:function(){_5.remove(this.costListNode,"hidden");_5.remove(this.totalCostNode,"hidden");_5.remove(this.startCostNode,"hidden");_5.remove(this.endCostNode,"hidden");},showSelectAddress:function(){_5.remove(this.addrListNode,"hidden");},hideSelectAddress:function(){_5.add(this.addrListNode,"hidden");},showSelectList:function(_1a,_1b){this.zoneNode=_1b;this.addrListNode.innerHTML="";if(_1a==undefined||_1a==null){return;}for(var i=0;i<_1a.length;i++){var _1c=_1a[i];var tr=document.createElement("tr");tr.setAttribute("data-obj",JSON.stringify(_1c));var _1d=document.createElement("td");_1d.innerHTML=_1c.name;_1d.setAttribute("data-obj",JSON.stringify(_1c));var _1e=document.createElement("td");_1e.innerHTML=_1c.address;_1e.setAttribute("data-obj",JSON.stringify(_1c));tr.appendChild(_1d);tr.appendChild(_1e);this.addrListNode.appendChild(tr);}},getSelectCost:function(e){var e=e?e:window.event,_1f=e.target,_20=_1f.getAttribute("data-obj");var _21=JSON.parse(_20);if(this.zoneNode=="startZoneNode"){startZone=_21;this.startZoneNode.value=startZone.name;}else{if(this.zoneNode=="endZoneNode"){endZone=_21;this.endZoneNode.value=endZone.name;}}this.hideSelectAddress();},bindChange:function(){var _22=this;this.startZoneNode.oncompositionstart=function(){this.aplock=true;}.bind(this);this.startZoneNode.oncompositionend=function(){this.aplock=false;}.bind(this);this.startZoneNode.oninput=function(){if(!this.aplock){startZone=null;this.hideCostContainer();var _23=this.startZoneNode.value;_23=_23.replace(/\s+/g,"");if(_23===""||_23===null){return;}var _24={words:_23,citycode:"",num:20};this.configFacade.getInterestPlace(this.url+"ags/findAddress",_24,function(_25){if(_25.code==="1000"){_22.showSelectAddress();var _26=_25.detail;_22.showSelectList(_26,"startZoneNode");}else{_22.hideSelectAddress();}},function(err){});}}.bind(this);this.endZoneNode.oncompositionstart=function(){this.aplock=true;};this.endZoneNode.oncompositionend=function(){this.aplock=false;};this.endZoneNode.oninput=function(){if(!_22.aplock){endZone=null;_22.hideCostContainer();var _27=_22.endZoneNode.value;_27=_27.replace(/\s+/g,"");if(_27===""||_27==null){return;}var _28={words:_27,citycode:"",num:20};_22.configFacade.getInterestPlace(_22.url+"ags/findAddress",_28,function(_29){if(_29.code==="1000"){_22.showSelectAddress();var _2a=_29.detail;_22.showSelectList(_2a,"endZoneNode");}else{_22.hideSelectAddress();}},function(err){});}};},addressHandle:function(_2b){this.zoneListNode.innerHTML="";if(_2b==null){return;}var _2c=0;for(var i=this.startPageNumber;i<this.endPageNumber;i++){_2c=_2c+1;var _2d=_2b[i].address;var _2e=_2b[i].name;var _2f=JSON.stringify(_2b[i]);var li=document.createElement("li");var _30=document.createElement("strong");_30.className="zoneIcon";_30.innerHTML=_2c;var _31=document.createElement("span");_31.innerHTML=_2e;var p=document.createElement("p");p.innerHTML=_2d;var div=document.createElement("div");var _32=document.createElement("button");_32.className="start";_32.setAttribute("data-point",_2f);var _33=document.createElement("button");_33.className="end";_33.setAttribute("data-point",_2f);div.appendChild(_32);div.appendChild(_33);li.appendChild(_30);li.appendChild(_31);li.appendChild(p);li.appendChild(div);this.zoneListNode.appendChild(li);}},getCenterPoint:function(_34){if(_34&&_34.length>0){var _35=_34[0][0];var _36=_34[0][1];var _37=_34[0][0];var _38=_34[0][1];}_34.forEach(function(_39){_35=_39[0]<_35?_39[0]:_35;_37=_39[0]>_37?_39[0]:_37;_36=_39[1]<_36?_39[1]:_36;_38=_39[1]>_38?_39[1]:_38;});var _3a={x:(Number(_35)+Number(_37))/2,y:(Number(_36)+Number(_38))/2};return _3a;},getPointData:function(_3b){},searchKeyZone:function(){var _3c=this.cnameNode.value;if(_3c===""||_3c==null){alert("请输入地址");}else{var _3d=zoneSelect.getValue();var _3e={words:_3c,citycode:_3d,num:20};var _3f=this;this.configFacade.getInterestPlace(this.url+"ags/findAddress",_3e,function(_40){if(_40.code==="1000"){_3f.startPageNumber=0;_3f.endPageNumber=5;addressList=_40.detail;_5.remove(_3f.pageContainerNode,"hidden");if(addressList.length<=_3f.endPageNumber){_3f.endPageNumber=addressList.length;}_3f.addressHandle(addressList);}else{alert(_40.info);}},function(err){});}},prevPage:function(){if(this.startPageNumber===0){return;}this.endPageNumber=this.startPageNumber;this.startPageNumber=this.endPageNumber-5;if(this.startPageNumber<0){this.startPageNumber=0;}this.addressHandle(addressList);},nextPage:function(){if(this.endPageNumber===addressList.length){return;}this.startPageNumber=this.endPageNumber;this.endPageNumber=this.endPageNumber+5;if(this.endPageNumber>addressList.length){this.endPageNumber=addressList.length;}this.addressHandle(addressList);},zoneListClick:function(e){e=e?e:window.event,target=e.target,type=target.className;var _41=this;var _42=function(){_5.remove(_41.seaBtnNode,"myselect");_5.add(_41.pathBtnNode,"myselect");_5.add(_41.seaTabNode,"hidden");_5.remove(_41.pathTabNode,"hidden");_41.hideCostContainer();};switch(type){case "start":_42();this.paintStart(target);break;case "end":_42();this.paintEnd(target);break;}},paintStart:function(_43){var _44=_43.getAttribute("data-point");startZone=JSON.parse(_44);this.startZoneNode.value=startZone.name;var _45=startZone.centerPoint;var _46=_45.indexOf("("),_47=_45.indexOf(" ",_46),end=_45.indexOf(")");var x=_45.substring(_46+1,_47),y=_45.substring(_47+1,end);var _48=this.map.findLayerById("drawLayer");_48.dotSymbol.imageUrl="images/qi.png";_48.dotSymbol.vertical=true;_48.dotSymbol.loaded=false;_48.dotSymbol.color=null;this.map.locatePoint(new _c(x*1,y*1));},paintEnd:function(_49){var _4a=_49.getAttribute("data-point");endZone=JSON.parse(_4a);this.endZoneNode.value=endZone.name;var _4b=endZone.centerPoint;var _4c=_4b.indexOf("("),_4d=_4b.indexOf(" ",_4c),end=_4b.indexOf(")");var x=_4b.substring(_4c+1,_4d),y=_4b.substring(_4d+1,end);var _4e=this.map.findLayerById("drawLayer");_4e.dotSymbol.imageUrl="images/zhong.png";_4e.dotSymbol.vertical=true;_4e.dotSymbol.loaded=false;_4e.dotSymbol.color=null;var p=this.map.geometryTo3D(new _c(x,y));_3.publish("mapDrawDot",{x:p.x,y:p.y});},changeCost:function(){var _4f=this.startZoneNode.value;var _50=this.endZoneNode.value;this.endZoneNode.value=_4f;this.startZoneNode.value=_50;var _51=startZone;startZone=endZone;endZone=_51;this.searchPath();},costHandle:function(_52,_53){this.costListNode.innerHTML="";if(_52==null||_52.length==0){return;}for(var i=0;i<_52.length;i++){var _54=Math.floor(parseInt(_52[i].cost));var tr=document.createElement("tr");var _55=document.createElement("td");_55.innerText=i+1;var _56=document.createElement("td");_56.innerText=_52[i].name;var _57=document.createElement("td");_57.innerText=_52[i].direction;var _58=document.createElement("td");_58.innerText=_54+"米";tr.appendChild(_55);tr.appendChild(_56);tr.appendChild(_57);tr.appendChild(_58);this.costListNode.appendChild(tr);}this.totalCostNode.innerHTML="总路程: "+Math.floor(_53)+" 米";_5.remove(this.totalCostNode,"hidden");},searchPath:function(){var _59=this;var _5a=this.startZoneNode.value,_5b=this.endZoneNode.value;if(_5a==""||_5b==""){return;}if(startZone==null||endZone==null){alert("请输入有效地址");return;}var _5c=startZone.centerPoint,_5d=endZone.centerPoint;var _5e=_5c.slice(7,_5c.length-1).replace(/\ /g,",");var end=_5d.slice(7,_5c.length-1).replace(/\ /g,",");var _5f=_5e+";"+end;this.hideCostContainer();this.configFacade.getCostPath(this.url+"ags/findShortPath?stops="+_5f,function(_60){if(_60.code==="1000"){var _61=_60.totalcost;var _62=_60.detail;_59.showCostContainer();_59.startCostNode.innerHTML=startZone.name;_59.endCostNode.innerHTML=endZone.name;_59.costHandle(_62,_61);_59.drawPath(_62);}else{alert(_60.info);}},function(err){});},drawPath:function(_63){var _64,len=_63.length,_65,_66,x,y,_67;var _68=this.map.findLayerById("drawLayer");var _69=_68.lineSymbol;var _6a=[];var _6b;var _6c;var _6d=[];for(var i=0;i<len;i++){_64=_63[i];_6a=[];_65=_64.geom;_65=_65.substring(_65.indexOf("(")+1,_65.indexOf(")"));_66=_65.split(",");return;for(var j=0;j<_66.length;j++){_67=_66[j].trim();_6b=_67.indexOf(" ");x=_67.substring(0,_6b);y=_67.substring(_6b+1);_6c=this.map.geometryTo3D({x:x*1,y:y*1});_6a.push(_6c.x,_6c.y);}_6d.push(_6a);}_68.addLine(_6d);},getStartCost:function(){this.zoneNode="startZoneNode";this.getZoneFlag=true;_6.set(this.map.domNode,"cursor","url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");this.hideCostContainer();this.startZoneNode.value="";startZone=null;},getEndCost:function(){this.zoneNode="endZoneNode";this.getZoneFlag=true;_6.set(this.map.domNode,"cursor","url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");this.hideCostContainer();this.endZoneNode.value="";endZone=null;},getCostNameByPoint:function(_6e){if(!this.getZoneFlag){return;}var x=_6e.x,y=_6e.y;var _6f=x+","+y;var _70={point:_6f,tolerance:100,num:1};var _71=this;this.getZoneFlag=false;this.configFacade.getAddressAround(this.url+"ags/findAround",_70,function(_72){if(_72.code==="1000"){var _73=_72.detail[0];if(_71.zoneNode=="startZoneNode"){startZone=_73;_71.startZoneNode.value=startZone.name;_71.startCostNode.innerHTML=startZone.name;}if(_71.zoneNode=="endZoneNode"){endZone=_73;_71.endZoneNode.value=endZone.name;_71.endCostNode.innerHTML=endZone.name;}}else{alert(_72.info);}},function(err){});},selectSeaTab:function(){_5.add(this.seaBtnNode,"myselect");_5.remove(this.pathBtnNode,"myselect");_5.remove(this.seaTabNode,"hidden");_5.add(this.pathTabNode,"hidden");if(this.zoneListNode.innerHTML!=""){this.zoneListNode.innerHTML="";_5.add(this.pageContainerNode,"hidden");}},selectPathTab:function(){_5.remove(this.seaBtnNode,"myselect");_5.add(this.pathBtnNode,"myselect");_5.add(this.seaTabNode,"hidden");_5.remove(this.pathTabNode,"hidden");},zoneInit:function(){this.cnameNode.value="";this.startZoneNode.value="";this.endZoneNode.value="";this.zoneListNode.innerHTML="";_5.add(this.pageContainerNode,"hidden");_5.add(this.totalCostNode,"hidden");_5.add(this.startCostNode,"hidden");_5.add(this.costListNode,"hidden");_5.add(this.addrListNode,"hidden");_5.add(this.endCostNode,"hidden");}});});