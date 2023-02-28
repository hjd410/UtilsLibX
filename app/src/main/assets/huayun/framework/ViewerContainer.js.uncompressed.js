/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/6
 *  @time   :   15:44
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/ViewerContainer", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "../framework/context/GlobalContext",
        "../facades/ConfigFacade",
        "./ModuleXContainer",
        "../util/StringHelp"
    ],
    function (declare, domConstruct, GlobalContext, ConfigFacade, ModuleXContainer, StringHelp) {
        return declare("com.huayun.framework.ViewerContainer", [ModuleXContainer], {
            modulsesArr: [],
            _viewerContext: null,

            constructor: function () {
                this.context = GlobalContext.getInstance();
            },

            doInit: function () {
                // console.log(">>>ViewerContainer创建和装载匀已完成");
                var configData = this.get("configData");
                // console.log("=======ViewerContainer doInit=====", configData);
                var modules = configData.modules;
                for (var i = 0; i < modules.length; i++) {
                    var theModule = modules[i];
                    var preLoad = theModule.preLoad;
                    if (preLoad) {
                        this.preLoadVo.push(theModule);
                        this.currentModuleXVo = theModule;
                        this.createModuleX(theModule.id, theModule.identifyId);
                    }
                }
            },

            createModuleX: function (id, identifyId, complete) {
                this.currentId = id;
                this.currentIdentifyId = identifyId;
                // console.log("从Hash中查找Viewer ModuleX对象");
                var cwUI = this.cacheHash.get(id, identifyId);
                // console.log(cwUI,"-----------------------cwUI",cwUI != null);
                // console.log("createModuleX", id, identifyId, "ViewerContainer", cwUI, "this.currentId:", this.currentId, "this.currentIdentifyId:", this.currentIdentifyId);
                if (!StringHelp.isSpace(cwUI)) {
                    complete.call(this, cwUI);
                } else {
                    // console.log(this.context,"ViewerContainer",this._viewerContext);
                    this.context.getBean("baseContext", identifyId, function (data) {
                        this._viewerContext = data;
                        this._viewerContext.getBeanEx(id, identifyId, this.getBeanHandler.bind(this));
                    }.bind(this));
                }
            },

            getBeanHandler: function (viewModuleX) {
                var configData = this.get("configData");
                // console.log(configData, viewModuleX);
                var modules = configData.modules;
                for (var i = 0; i < modules.length; i++) {
                    // var theModule = modules[i];
                    // console.log(this.currentModuleXVo.configUrl);
                    this.cacheHash.put(this.currentId, this.currentIdentifyId, viewModuleX);
                    this.dispalyListHash.put(this.currentId, this.currentIdentifyId, viewModuleX);
                    viewModuleX.set("moduleXVo", this.currentModuleXVo);
                    viewModuleX.set("propertys", this.currentModuleXVo.propertys);
                    var methodList = this.currentModuleXVo["setMethod"];
                    for (var j = 0; j < methodList.length; j++) {
                        var methodObj = methodList[j];
                        viewModuleX.set(methodObj.name, methodObj.value);
                    }
                    // moduleX.set("onReadyFun", this.modulePreLoad.bind(this, moduleX));
                    viewModuleX.placeAt(this);
                    viewModuleX.startup();
                }
            }
        })
    }
);