require({cache:{
'url:com/huayun/widget/templates/ModuleX.html':"<div>\r\n</div>"}});
define(
    "com/huayun/widget/ModuleX", [
        "dojo/_base/declare",
        "dojo/ready",
        "dojo/dom",
        "dojo/dom-style",
        "../facades/ConfigFacade",
        "../util/StringHelp",
        "../event/EventDispatch",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_OnDijitClickMixin",
        "dojo/text!./templates/ModuleX.html"
    ],
    function (declare, ready, dom, domStyle, ConfigFacade, StringHelp, EventDispatch, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, template) {
        return declare("com.huayun.framework.widget.ModuleX", [EventDispatch, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
            templateString: template,

            constructor: function () {
                this.context = null;
                this._configData = null;
                this._isConfigData = false;//config的配置文件是否加载完成，true加载完成,false加载未完成
                this._completeFlag = false;//组件是否创建完成，false未完成,true完成
                this._configUrl = "";
                this._moduleXVo = null;
                this._onReadyFun = null;
                this._propertys = null;
                this.isOnReady = false;
                this.configFacade = new ConfigFacade();
                // console.log(this.configFacade);
            },

            postCreate: function () {
                this.inherited(arguments);
                // this._completeFlag = true;
                // domStyle.set(this.domNode, "pointer-events", "all");
                if (!StringHelp.isSpace(this.configUrl) || !StringHelp.isSpace(this.isConfigData)) {   //
                    // console.log(">>>组件" + this.id + "需要配置数据");
                    this._isConfigData = true;  //需要加载配置json
                    this._configUrl = this.configUrl;    //json配置路径
                } else {    //
                    // console.log(">>>组件" + this.id + "无需配置数据");
                    this._isConfigData = false;
                }
            },

            placeAt: function () {
                this.inherited(arguments);
                this._completeFlag = true;
            },

            startup: function () {
                this.inherited(arguments);
                this.isOnReady = true;
                this.tryInit(this.id);
                // console.log(this.params.id, ">>>>>>>>>>>>>startup");
                // this.startModule(this.params.id);
                // this.onReady(this.tryInit.bind(this, this.params.id));
            },

            _setIsConfigDataAttr: function (value) {
                this._isConfigData = value;
            },

            _getIsConfigDataAttr: function () {
                return this._isConfigData;
            },

            _setPropertysAttr: function (value) {
                this._propertys = value;
                this._setPorpertyMethod(value);
            },

            _setModuleXVoAttr:function(value){
                this._moduleXVo = value;
            },

            _getPropertysAttr: function () {
                return this._propertys;
            },

            _getConfigUrlAttr: function () {
                return this._configUrl;
            },

            _setPorpertyMethod: function (list) {
                if (!StringHelp.isSpace(list) && list.length > 0) {
                    // console.log(this.id, list);
                    for (var i = 0; i < list.length; i++) {
                        // console.log(list[i].name);
                        switch (list[i].type) {
                            case "ref":
                                this.context.beanProcess(this._moduleXVo,this);
                                // console.log(this._moduleXVo,this.context);
                                break;
                            case "number":
                                this[list[i].name] = Number(list[i].value);
                                break;
                            default:
                                this[list[i].name] = list[i].value;

                        }
                    }
                }
            },
            /**
             * 设置样式
             * @param value
             * @private
             */
            _setStyleAttr: function (value) {
                if (!StringHelp.isSpace(value)) {
                    // console.log(value);
                    for (var item in value) {
                        domStyle.set(this.domNode, item, value[item]);
                    }
                }
            },
            /**
             * 设置configurl 会触发config配置的加载，加载完成后尝试调用tryInit
             * @param value
             * @private
             */
            _setConfigUrlAttr: function (value) {
                var url = require.toUrl(value);
                if (!StringHelp.isSpace(value)) {
                    this.set("isConfigData", true);
                    this._configUrl = url;
                    this._loaderConfigData();
                }
            },
            /**
             *
             * @private
             */
            _setConfigDataAttr: function (value) {
                this._configData = value;
                this.tryInit(this.id);
            },

            _getConfigDataAttr: function () {
                return this._configData;
            },
            _setOnReadyFunAttr: function (value) {
                // console.log("----------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", value);
                this._onReadyFun = value;
            },
            /**
             * 加载配置文件
             * @private
             */
            _loaderConfigData: function () {
                this.configFacade.getConfigData(require.toUrl(this._configUrl), function (data) {
                    // console.log(data,this.id);
                    this.set("configData", data);
                }.bind(this), function (err) {
                    console.log(err);
                }.bind(this));
            },

            /*            loadConfigDataComplete: function () {
                            // console.log(">>>加载配置数据完成：",dom.byId(this.id));
                            this.tryInit(this.id);
                        },*/

            tryInit: function (target) {
                // console.log(target, ">>>tryInit：", this._configData, this._isConfigData, this._completeFlag, this.isOnReady);
                // console.log(target, "================tryInit=============", this.configData,this._isConfigData, this._configUrl,this._completeFlag,this.isOnReady);
                if (!this._isConfigData) {
                    if (this._completeFlag && this.isOnReady) {
                        // console.log(">>>组件--" + target + "：已被加载到dom上");
                        this.doInit();
                        this.readyCall();
                    }
                } else {
                    if (this._completeFlag && this._configData !== null && this.isOnReady) {
                        // console.log(">>>组件--" + target + "：配置数据完成，并已被加载到dom上");
                        this.doInit();
                        this.readyCall();
                    }
                }
            },
            doInit: function () {
                // console.log(">>>组件--" + this.id + ":创建和装载匀已完成******************");
                console.log(this.context.lookUp(this.id));
            },
            /**
             * 组件创建完成后回调
             */
            readyCall: function () {
                if (this._onReadyFun) {
                    // console.log(">>>组件--" + this.id + ":完成后回调",this);
                    this._onReadyFun();
                }
            },

            /*            startModule: function (target) {
                            console.log(target, ">>>startModule方法被调用", this._isConfigData, this._configUrl);
                            if (!this._isConfigData) { //是否需要加载配置数据，默认false 无需加载
                                // console.log(">>>", target, "无需加载配置json");
                                this.tryInit(target);
                            } else {
                                if (StringHelp.isSpace(this._configUrl)) {
                                    // console.log(">>>" + target + "--加载路径为：", this._configUrl, StringHelp.isSpace(this._configUrl),this.configData);
                                    this.loadConfigDataComplete();
                                } else {

                                }
                                // console.log(">>>", target, "加载配置json：" + this._configUrl);
                            }
                        },*/

            createModuleX: function (id, identifyId) {

            },

            startBean: function () {

            }

        });
    }
);