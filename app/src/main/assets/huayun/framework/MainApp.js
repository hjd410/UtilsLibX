//>>built
define("com/huayun/framework/MainApp",["dojo/_base/declare","dojo/ready","dojo/dom","dojo/dom-construct","dojo/dom-style","dojo/request","./context/GlobalContext","./vo/BeanVo","../util/StringHelp","../util/HashTable","../widget/ModuleX"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b){return _1("com.huayun.framework.MainApp",[_b],{mainForm:null,url:"http://oauth-server-kaifa.test.cloud.zj.sgcc.com.cn/oauth/token?client_id=oauth&grant_type=password&scope=read&username=",constructor:function(){this.context=_7.getInstance();},postCreate:function(){this.inherited(arguments);_5.set(this.domNode,"width","100%");_5.set(this.domNode,"height","100%");},formatConfigData:function(){this.formatBeanData();},formatBeanData:function(){var _c=this.get("configData");window.access_token=_c.configuration.access_token;if(!_9.isSpace(_c["configuration"]["config"])){this.formatContextConfig(_c["configuration"]["config"]);}var _d=require.toUrl(_c["configuration"]["beanfiles"]["beanfile"]["url"]);this.configFacade.getConfigData(_d,function(_e){this.resolutionBean(_e["configuration"]["beans"]);this.addMainForm(_c);}.bind(this),function(_f){});},resolutionBean:function(_10){for(var i=0;i<_10.length;i++){var _11=_10[i]["bean"];var _12=new _8();_12.clazz=_11.clazz;_12.id=_11.id;_12.isSingle=_11.isSingle;_12.type=_11.type;_12.propertys=_11.propertys;_12.identifyId=_11.identifyId;_12.setMethod=_11.setMethod;this.context.get("hash").put(_12.id,_12);}},doInit:function(){this.formatConfigData();},addMainForm:function(_13){if(this.mainForm!==null){var _14=_13["configuration"]["viewContainer"];this.mainForm.set("configData",_14);this.mainForm.placeAt(this.domNode);this.mainForm.startup();}},formatContextConfig:function(_15){var _16=new _a();for(var i=0;i<_15.length;i++){var _17=_15[i]["name"];var _18=_15[i]["value"];_16.put(_17,_18);}this.context.set("config",_16);}});});