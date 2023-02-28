/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/6
 *  @time   :   15:15
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/MainApp", [
        "dojo/_base/declare",
        "dojo/ready",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/request",
        "./context/GlobalContext",
        "./vo/BeanVo",
        "../util/StringHelp",
        "../util/HashTable",
        "../widget/ModuleX"
    ],
    function (declare, ready, dom, domConstruct, domStyle, request, GlobalContext, BeanVo, StringHelp, HashTable, ModuleX) {
        return declare("com.huayun.framework.MainApp", [ModuleX], {
            mainForm: null,
            url: 'http://oauth-server-kaifa.test.cloud.zj.sgcc.com.cn/oauth/token?client_id=oauth&grant_type=password&scope=read&username=',

            constructor: function () {
                this.context = GlobalContext.getInstance();
                // console.log("=========MapApp constructor=====", this.context, this);
            },

            /*            loadConfigDataComplete: function () {
                            // console.log("===MainApp loadConfigDataComplete===", this.configData, this.mainForm);
                            this.inherited(arguments);
                            // this.formatConfigData();
                        },*/

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "width", "100%");
                domStyle.set(this.domNode, "height", "100%");
                // domConstruct.create("div", {innerHTML: "<h1>This is Left Panel</h1>"}, this.domNode);/**/
            },

            formatConfigData: function () {
                this.formatBeanData();
            },

            formatBeanData: function () {
                var configData = this.get("configData");
                window.access_token = configData.configuration.access_token;
                if (!StringHelp.isSpace(configData["configuration"]["config"])) {
                    this.formatContextConfig(configData["configuration"]["config"]);
                }
                var beanUrl = require.toUrl(configData["configuration"]["beanfiles"]["beanfile"]["url"]);
                // console.log(beanUrl);
                this.configFacade.getConfigData(beanUrl, function (data) {
                    this.resolutionBean(data["configuration"]["beans"]);
                    this.addMainForm(configData);
                }.bind(this), function (err) {
                    console.log(err);
                });
            },
            /**
             * 解析bean对象
             * @param list
             */
            resolutionBean: function (list) {
                // console.log(list,">>>>>>>>>>>>>>>>>>>>>>>>>>");
                for (var i = 0; i < list.length; i++) {
                    var bean = list[i]["bean"];
                    // console.log(bean, bean.id);
                    var beanVo = new BeanVo();
                    beanVo.clazz = bean.clazz;
                    beanVo.id = bean.id;
                    beanVo.isSingle = bean.isSingle;
                    beanVo.type = bean.type;
                    beanVo.propertys = bean.propertys;
                    beanVo.identifyId = bean.identifyId;
                    beanVo.setMethod = bean.setMethod;
                    this.context.get("hash").put(beanVo.id, beanVo);
                }
            },

            doInit: function () {
                this.formatConfigData();
                // console.log(">>>MainApp doInit方法被调用");
                /*this.url = this.url + dojoConfig.app.info.split(",")[0] + "&password=" + md5(dojoConfig.app.info.split(",")[1] + "");
                request.post(this.url, {handleAs: "json"}).then(function (resp) {
                    this.formatConfigData();
                }.bind(this), function (err) {
                    alert("权限不足，请联系管理员！！！");
                });*/
            },

            addMainForm: function (configData) {
                if (this.mainForm !== null) {
                    // this.mainForm.viewerConfigData = configData["configuration"]["viewContainer"];
                    var viewConfigData = configData["configuration"]["viewContainer"];
                    this.mainForm.set("configData", viewConfigData);
                    this.mainForm.placeAt(this.domNode);
                    this.mainForm.startup();
                }
            },

            formatContextConfig: function (configJson) {
                var tempHash = new HashTable();
                for (var i = 0; i < configJson.length; i++) {
                    var name = configJson[i]["name"];
                    var value = configJson[i]["value"];
                    tempHash.put(name, value);
                }
                this.context.set("config", tempHash);
            }
        })
    }
);