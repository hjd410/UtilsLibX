/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/6
 *  @time   :   15:16
 *  @Email  :   530904731@qq.com
 */
define(
  "com/huayun/framework/ModuleXContainer", [
      "dojo/_base/declare",
      "dojo/dom-construct",
      "dojo/dom-style",
      "../util/HashTableEx",
      "../facades/ConfigFacade",
      "../util/StringHelp",
      "../widget/ModuleX"
  ],
  function (declare, domConstruct, domStyle, HashTableEx, ConfigFacade, StringHelp, ModuleX) {
      return declare("com.huayun.framework.ModuleXContainer", [ModuleX], {


          constructor: function () {
              this.cacheHash = new HashTableEx();
              this.dispalyListHash = new HashTableEx();
              this.moduleXHash = new HashTableEx();
              this.currentId = "";
              this.currentIdentifyId = "";
              this._configFacade = new ConfigFacade();
              this.preLoadVo = [];
              this.unPreLoadVo = [];
              this.currentModuleXVo = null;
              this.currentReadyFun = null;
              this.complete = null;
              this.doLoadComplete = null;
          },

          postCreate: function () {
              this.inherited(arguments);
              domStyle.set(this.domNode, "pointer-events", "none");
              domStyle.set(this.domNode, "width", "100%");
              domStyle.set(this.domNode, "height", "100%");
          },

          /*            loadConfigDataComplete: function () {
                          // console.log("===========================ModuleXContainer loadConfigDataComplete==================");
                      },*/
            /**
             * 创建ModuleX
             * @param id
             * @param identifyId
             * @param complete
             */
          createModuleX: function (id, identifyId, complete) {
              // console.log("创建组件>>>id:", id, "----identifyId:", identifyId, this.configData);
              // console.log("创建ModuleX的时候先从hash中查找");
              // console.log(this.cacheHash);
              this.complete = complete;
              var cwUI = this.cacheHash.get(id, identifyId);
              // console.log("cwUI:", cwUI, StringHelp.isSpace(cwUI));
              // if (cwUI !== null && cwUI !== undefined) {
              if (!StringHelp.isSpace(cwUI)) {
                  complete.call(this, cwUI);
                  // cwUI.refresh();
              } else {
                  //配置文件中没有对应的配置信息
                  // console.log(this.currentId, this.currentModuleXVo);
                  var theVo = this.moduleXHash.get(id, identifyId);
                  // if (theVo === null || theVo.id !== id || !StringHelp.isStrEqual(theVo.identifyId, identifyId)) {
                  if (StringHelp.isSpace(theVo)) {
                      var beanList = this.context.get("hash").getKeyList();

                      for (var i = 0; i < beanList.length; i++) {
                          if (beanList[i] === id) {
                              var beanVo = this.context.get("hash").get(id);
                              // console.log(id, beanVo.propertys);
                              if (!StringHelp.isSpace(beanVo.propertys)) {
                                  var reg = /^\$\{(.*)\}$/;
                                  //
                                  for (var j = 0; j < beanVo.propertys.length; j++) {
                                      // var type = beanVo.propertys[j].type;
                                      var name = beanVo.propertys[j].name;
                                      var value = beanVo.propertys[j].value;
                                      if (reg.test(value)) {
                                          value = StringHelp.extractProerty(value);
                                          beanVo.propertys[j].value = this.context.findConfigvalue(value);
                                          // this.currentModuleXVo = beanVo;
                                          continue;
                                      }
                                  }
                              }
                              this.moduleXHash.put(id, identifyId, beanVo);
                          }
                      }
                  }
                  this.context.getBeanEx(id, identifyId, this.getBeanHandler.bind(this));
              }
          },
            /**
             * 加载ModuleX
             * @param complete
             */
          doLoadModuleX: function (complete) {  //开始加载组件
              var configData = this.get("configData");
              // console.log(">>>组件--" + this.id + ";---identifyId:" + this.identifyId + "：开始加载", configData);
              this.complete = complete;
              // debugger;
              for (var i = 0; i < configData["configuration"].container.modules.length; i++) {
                  var theModuleXVo = configData["configuration"].container.modules[i];
                  this.moduleXHash.put(theModuleXVo.id, theModuleXVo.identifyId, theModuleXVo);
              }
              this.modulePreLoad();
          },
            /**
             * 预加载组件
             */
          modulePreLoad: function () {
              // var configData = this.get("configData");
              // console.log("==============modulePreLoad=============", this.id, configData);
              var hashKeyList = this.moduleXHash.getKeyList();
              // console.log(hashKeyList);
              for (var i = 0; i < hashKeyList.length; i++) {
                  var hashKeyListElement = hashKeyList[i];
                  var theVo = this.moduleXHash.get(hashKeyListElement.majorKey, hashKeyListElement.deputyKey);
                  // console.log(hashKeyListElement, theVo);
                  for (var j = 0; j < theVo.propertys.length; j++) {
                      if (theVo.propertys[j].name === "configUrl") {
                          theVo.configUrl = theVo.propertys[j].value;
                      }
                  }
                  if (theVo.preLoad) {
                      this.preLoadVo[this.preLoadVo.length] = theVo;
                      // this.createModuleX(theVo.id, theVo.identifyId);
                  }
              }
              this._addPreModule();
          },

          _addPreModule: function () {
              if (this.preLoadVo.length > 0) {
                  var vo = this.preLoadVo.shift();
                  // this.currentModuleXVo = vo;
                  // console.log("通过预加载创建组件:", vo);
                  this.createModuleX(vo.id, vo.identifyId, this.complete);
              } else {
                  // console.log("所有预加载完成", this.complete);
                  this.complete.call(this);
              }
          },

          addModuleX: function (target) {
              // console.log(target, ">>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<");
              // target.placeAt(this);
              // this.getBeanHandler(target);
              // target.startup();
              // console.log(target, "------------------------------add ModuleX", this.configData);
          },
            /**
             * 获取bean处理信息
             * @param moduleX
             */
          getBeanHandler: function (moduleX) {
              // console.log(moduleX);
              var theId, theIdentifyId;
              theId = typeof moduleX.identifyId === "undefined" ? moduleX.id : moduleX.id.slice(0, -moduleX.identifyId.length);
              theIdentifyId = moduleX.identifyId;
              // console.log(theId, theIdentifyId);
              this.cacheHash.put(theId, theIdentifyId, moduleX);
              this.dispalyListHash.put(theId, theIdentifyId, moduleX);
              var theModuleXVo = this.moduleXHash.get(theId, theIdentifyId);
              moduleX.set("moduleXVo", theModuleXVo);
              moduleX.set("propertys", theModuleXVo.propertys);
              moduleX.set("style", theModuleXVo.style);
              // moduleX.set("setMethod",this.currentModuleXVo.style);
              // console.log(this.currentId, this.currentIdentifyId, moduleX);
              var methodList = theModuleXVo["setMethod"];
              // console.log(methodList);
              if (!StringHelp.isSpace(methodList)) {
                  for (var j = 0; j < methodList.length; j++) {
                      var methodObj = methodList[j];
                      moduleX.set(methodObj.name, methodObj.value);
                  }
              }
              // moduleX.set("isConfigData", !StringHelp.isSpace(this.currentModuleXVo.configUrl));
              moduleX.set("onReadyFun", this._addPreModule.bind(this, moduleX));
              moduleX.placeAt(this);
              moduleX.startup();
          },

          doInit: function () {
              this.doLoadModuleX(function () {
                  // console.log(this.id, this.identifyId);
              }.bind(this));
          },
          /**
           * 依据id查找moduleX
           * @param id
           * @param identifyId
           * @returns {*}
           */
          findModuleX: function (id, identifyId) {
              // console.log("findModuleX:---identifyId", id, identifyId, this.dispalyListHash.get(id, identifyId));
              return this.dispalyListHash.get(id, identifyId);
          },
          /**
           * 关闭ModuleX，但并不会从内存中删除
           * @param id
           * @param identifyId
           */
          closeModuleX: function (id, identifyId) {
              var mc = this.cacheHash.get(id, identifyId);
              /*domConstruct.destroy(mc.domNode);*/
              mc.destroy();
          },
          /**
           * 销毁ModuleX，会从内在中彻底删除
           * @param id
           * @param identifyId
           */
          destroyModuleX: function (id, identifyId) {
              var mc = this.cacheHash.get(id, identifyId);
              mc.destroy();
              this.cacheHash.remove(id, identifyId);
              this.dispalyListHash.remove(id, identifyId);
          }
      });
  }
);
