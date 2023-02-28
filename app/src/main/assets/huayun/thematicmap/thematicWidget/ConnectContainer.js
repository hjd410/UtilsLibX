//>>built
define("com/huayun/thematicmap/thematicWidget/ConnectContainer","require dojo/_base/declare dojo/dom dojo/dom-class dojo/dom-construct dojo/request dojo/on dojo/query ../../facades/PowerFacade ../../thematicmap/tool/Treedata dijit/_WidgetBase dijit/_TemplatedMixin dijit/_OnDijitClickMixin dojo/text!../widget/templates/power-connect.html".split(" "),function(h,q,g,f,d,r,m,n,t,u,v,w,x,y){return q("",[v,w,x],{templateString:y,baseClass:"power-connect",picUrl:h.toUrl("com/huayun/webgis/css/images/power/sign_close.png"),
pic1Url:h.toUrl("com/huayun/webgis/css/images/power/greencircle.png"),pic2Url:h.toUrl("com/huayun/webgis/css/images/power/close.png"),pic3Url:h.toUrl("com/huayun/webgis/css/images/power/greenp.png"),pic4Url:h.toUrl("com/huayun/webgis/css/images/power/redcircle.png"),pic5Url:h.toUrl("com/huayun/webgis/css/images/power/close.png"),pic6Url:h.toUrl("com/huayun/webgis/css/images/power/redp.png"),constructor:function(a){this.map=a.map;this.view=this.map.view;this.data={endID:"",mapID:"",opStatus:"true",
startID:"",type:"",userBean:{buro:"",dynamic:"true"}};this._powerFacade=new t;this._treedata=new u;this.url="http://10.136.35.108:8082/topo-server/topoCenter/normalServices/connectedPath";this.mixUrl="http://10.136.35.108:8082/vdc/dataService/t_dxt_mergerel";this.dicUrl="http://gateway.test.cloud.zj.sgcc.com.cn/vdc/dataService/META_MODEL_CLASS?access_token\x3db99e03be-dd1e-428b-aeea-d12bdab254d6";this.devs=[];this.endClick=this.startClick=null;this.heightLight=[];this.showMes=[];this.currGraphic=
this.treeData=this.dicArry=null},postCreate:function(){r.get(this.dicUrl,{handleAs:"json"}).then(function(a){this.dicArry=a}.bind(this))},onConnectClose:function(){this.domNode.style.display="none";this.restore()},onstartCloseDev:function(){g.byId("startDev").innerHTML="\u8bf7\u8f93\u5165\u8d77\u59cb\u8bbe\u5907";this.data.startID="";this.startClick&&(this.startClick.remove(),this.startClick=null);this.endClick&&(this.endClick.remove(),this.endClick=null);this.delCursor();this.resetDiv()},onstartSelect:function(){event.stopPropagation();
event.preventDefault();f.add(n(".webgis-root")[0],"changeCursor");f.add(this.ownerDocumentBody,"changeCursor");this.startClick&&(this.startClick.remove(),this.startClick=null);this.startClick=m(this.view.domNode,"click",function(a){a=this.view.screenToGeometry(a.clientX,a.clientY);var b=this.view.queryGraphicsByGeometry(a,5);if(0<b.length){var d,l;a=0;for(b=b[0].feature.attributes;a<b.length;a++)"dev_id"===b[a].name&&(d=b[a].value),"name"===b[a].name&&(l=b[a].value);this.data.startID=d;g.byId("startDev").innerHTML=
l;this.delCursor();this.startClick.remove();this.startClick=null;""!==this.data.endID&&this.getAndShowData()}}.bind(this))},onendCloseDev:function(){g.byId("endDev").innerHTML="\u8bf7\u8f93\u5165\u7ec8\u6b62\u8bbe\u5907";this.data.endID="";this.startClick&&(this.startClick.remove(),this.startClick=null);this.endClick&&(this.endClick.remove(),this.endClick=null);this.delCursor();this.resetDiv()},onendSelect:function(){event.stopPropagation();event.preventDefault();f.add(n(".webgis-root")[0],"changeCursor");
f.add(this.ownerDocumentBody,"changeCursor");this.endClick&&(this.endClick.remove(),this.endClick=null);this.endClick=m(this.view.domNode,"click",function(a){a=this.view.screenToGeometry(a.clientX,a.clientY);var b=this.view.queryGraphicsByGeometry(a,5);if(0<b.length){var d,l,p;a=0;for(b=b[0].feature.attributes;a<b.length;a++)"map_id"===b[a].name&&(d=b[a].value),"dev_id"===b[a].name&&(l=b[a].value),"name"===b[a].name&&(p=b[a].value);this.data.map_id=d.toString();this.data.endID=l;g.byId("endDev").innerHTML=
p;this.delCursor();this.endClick.remove();""!==this.data.startID&&this.getAndShowData()}}.bind(this))},getAndShowData:function(){d.empty(g.byId("conListShow"));if(0<this.heightLight.length){for(var a=0;a<this.heightLight.length;a++)this.heightLight[a].glow=null;this.view.threeRender()}this._powerFacade.getPowerConnectData(this.url,this.data,function(a){if(null!==a.data&&0<a.data.length){this.devs=[];this.heightLight=[];this.showMes=[];for(var b=0;b<a.data.length;b++)-1===this.devs.indexOf(a.data[b].devID)&&
this.devs.push(a.data[b].devID);this._powerFacade.getMixtureData(this.mixUrl+"?map_id\x3d"+this.data.map_id+"\x26REL_DEV_ID\x3d"+this.devs,function(a){for(var b=0;b<a.data.length;b++){var c=a.data[b].MERGE_FID;-1===this.devs.indexOf(c)&&this.devs.push(c)}for(b=0;b<this.devs.length;b++){var e=this.view.queryGraphicByDevId(this.devs[b]);if(null!==e){this.heightLight.push(e);a={};c=0;for(e=e.feature.attributes;c<e.length;c++)"name"===e[c].name&&(a.name=e[c].value),"dev_id"===e[c].name&&(a.devId=e[c].value),
"class_id"===e[c].name&&(a.classId=e[c].value);this.showMes.push(a)}}for(a=0;a<this.heightLight.length;a++)this.heightLight[a].glow={color:"#0ce386"};this.view.threeRender();this.treeData=this._treedata.getParentData(this.dicArry.data,this.showMes);for(var k in this.treeData){a=d.create("div",{class:"simpleShowCon"},g.byId("conListShow"));b=d.create("div",{class:"treeBtn"},a);d.create("span",{class:"pic"},b);d.create("span",{class:"picName",innerHTML:k},b);b=d.create("div",{class:"showMes"},a);for(c=
0;c<this.treeData[k].length;c++){var e=d.create("div",{class:"oneDev"},b),e=d.create("table",{class:"table"},e),h=d.create("tr",{class:"simpleShowP",devId:this.treeData[k][c].devId},e);d.create("td",{innerHTML:"\u540d\u79f0",class:"tdTitle",devId:this.treeData[k][c].devId},h);d.create("td",{innerHTML:this.treeData[k][c].name,devId:this.treeData[k][c].devId},h);e=d.create("tr",{class:"simpleShowP",devId:this.treeData[k][c].devId},e);d.create("td",{innerHTML:"\u8d44\u6e90ID",class:"tdTitle",devId:this.treeData[k][c].devId},
e);d.create("td",{innerHTML:this.treeData[k][c].devId,devId:this.treeData[k][c].devId},e)}m(a,"click",function(a){"pic"===a.target.getAttribute("class")?(f.remove(a.target,"pic"),f.add(a.target,"picOpen"),a.target.parentNode.nextElementSibling.style.display="block"):"picOpen"===a.target.getAttribute("class")&&(f.remove(a.target,"picOpen"),f.add(a.target,"pic"),a.target.parentNode.nextElementSibling.style.display="none");"td"===a.target.localName&&(this.currGraphic&&(this.currGraphic.glow={color:"#0ce386"},
this.view.threeRender()),(a=this.view.queryGraphicByDevId(a.target.getAttribute("devId")))?(this.view.setCenter(a.position,this.view.resolution),a.glow={color:"red"},this.view.threeRender()):alert("\u6b64\u56fe\u65e0\u8be5\u8bbe\u5907"),this.currGraphic=a);f.add(g.byId("conListShow"),"showScroll")}.bind(this))}}.bind(this),function(a){})}}.bind(this),function(a){})},restore:function(){this.startClick&&(this.startClick.remove(),this.startClick=null);this.endClick&&(this.endClick.remove(),this.endClick=
null);this.delCursor();this.resetDiv();g.byId("startDev").innerHTML="\u8bf7\u8f93\u5165\u8d77\u59cb\u8bbe\u5907";g.byId("endDev").innerHTML="\u8bf7\u8f93\u5165\u7ec8\u6b62\u8bbe\u5907"},delCursor:function(){f.remove(n(".webgis-root")[0],"changeCursor");f.remove(this.ownerDocumentBody,"changeCursor")},resetDiv:function(){d.empty(g.byId("conListShow"));f.remove(g.byId("conListShow"),"showScroll");if(0<this.heightLight.length){for(var a=0;a<this.heightLight.length;a++)this.heightLight[a].glow=null;this.view.threeRender()}}})});