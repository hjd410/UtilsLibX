//>>built
define("com/huayun/widget/containers/TabNavigator",["dojo/_base/declare","dojo/dom-construct","dojo/dom-class","dojo/dom-style","dojo/on","dojo/mouse","dojo/_base/fx","dojo/topic","./ViewStack","../../util/StringHelp","../../util/HashTable","../../framework/ModuleXContainer"],function(_1,_2,_3,_4,on,_5,_6,_7,_8,_9,_a,_b){return _1("com.huayun.widget.containers.TabNavigator",[_b],{lastSelectedIndex:0,_viewStack:null,_tabBarList:[],_moduleList:[],_moduleHash:null,constructor:function(){},postCreate:function(){this.inherited(arguments);_4.set(this.domNode,"pointer-events","all");this._moduleHash=new _a();},doInit:function(){this._viewStack=new _8();this._viewStack.placeAt(this.domNode);this._viewStack.startup();_4.set(this._viewStack.domNode,"top","38px");var _c=this.get("configData");this._moduleList=_c["configuration"]["container"]["modules"];this._createTabBar(this._moduleList);this._createBackButton();this._createModuelHash(this._moduleList);this.inherited(arguments);},_createBackButton:function(){var _d=_2.create("span",{style:"display:none;width: 20px;height:99px;position:absolute;top:45%;left:388px;"+"cursor:pointer;background:url('../dojo/com/huayun/widget/images/hide_btn.png') no-repeat center"},this.domNode);on(_d,"click",function(){_6.animateProperty({node:this.domNode,properties:{left:-400},duration:400}).play();var _e=this.context.lookUp("LeftDisplayButton");_4.set(_e.domNode,"display","block");}.bind(this));on(this.domNode,_5.enter,function(_f){_4.set(_d,"display","block");}.bind(this));on(this.domNode,_5.leave,function(evt){_4.set(_d,"display","none");}.bind(this));},_createTabBar:function(_10){for(var i=0;i<_10.length;i++){var _11=_10[i]["propertys"];for(var j=0;j<_11.length;j++){var _12=_11[j];if(_12.name==="label"){var _13=_2.create("div",{style:"width:80px;height:36px;float:left;text-align:center;line-height:36px;cursor:default;font-size:14px;color:#333;cursor:pointer;",innerHTML:_12.value},this.domNode);on(_13,"click",this._tabChangeHandler.bind(this));this._tabBarList.push(_13);continue;}}}_4.set(this._tabBarList[0],"background","#3385ff");_2.create("hr",{style:"position:absolute;left:0;top:37px;width:100%;background-color:#cdcdcd"},this.domNode);},getBeanHandler:function(_14){this.cacheHash.put(this.currentId,this.currentIdentifyId,_14);this.dispalyListHash.put(this.currentId,this.currentIdentifyId,_14);_14.set("moduleXVo",this.currentModuleXVo);var _15=this.currentModuleXVo.propertys;_14.set("propertys",_15);_14.set("style",this.currentModuleXVo.style);var _16=this.currentModuleXVo["setMethod"];if(!_9.isSpace(_16)){for(var j=0;j<_16.length;j++){var _17=_16[j];_14.set(_17.name,_17.value);}}_14.set("onReadyFun",this.modulePreLoad.bind(this,_14));this._viewStack.addChild(_14);},_createModuelHash:function(_18){for(var i=0;i<_18.length;i++){var _19=_18[i]["propertys"];for(var j=0;j<_19.length;j++){var _1a=_19[j];if(_1a.name==="label"){this._moduleHash.put(_1a.value,_18[i]);continue;}}}},_tabChangeHandler:function(_1b){this._cleanTabButtonStyle();_4.set(_1b.target,{"background":"#3385ff","color":"#fff"});var _1c=this._tabBarList.indexOf(_1b.target);if(_1c>-1){var key=_1b.target.innerHTML;var _1d=this._moduleHash.get(key);var id=_1d.id;var _1e=_1d.identifyId;var _1f=this.findModuleX(id,_1e);if(!_9.isSpace(_1f)){this._viewStack.selectedChild(_1f);}else{this.createModuleX(id,_1e,function(){_1f=this.findModuleX(id,_1e);this._viewStack.selectedChild(_1f);});}}_7.publish("tabChange",this._viewStack.selectedItem);},_cleanTabButtonStyle:function(){for(var i=0;i<this._tabBarList.length;i++){_4.set(this._tabBarList[i],{"background":"#FFF","color":"#333"});}}});});