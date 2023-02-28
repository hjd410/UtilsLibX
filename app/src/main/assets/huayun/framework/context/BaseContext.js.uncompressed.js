define(
    "com/huayun/framework/context/BaseContext", [
        "dojo/_base/declare",
        "../../util/HashTable",
        "../../util/StringHelp",
        "../../framework/vo/BeanVo",
        "../../util/ClassFacotry",
        "../../util/BaseGetAndSet"
    ],
    function (declare, HashTable, StringHelp, BeanVo, ClassFacotry, BaseGetAndSet) {
        return declare("com.huayun.framework.context.BaseContext", [BaseGetAndSet], {

            constructor: function () {
                this.parentContext = null;
                this._hash = new HashTable();
                this._config = new HashTable();
                this._singleCache = {};
                this._beanHash = new HashTable();
            },

            _setHashAttr: function (value) {
                this._hash = value;
            },

            _getHashAttr: function () {
                return this._hash;
            },

            _setParentContextAttr: function (value) {
                this.parentContext = value;
            },

            _setConfigAttr: function (value) {
                this._config = value;
            },
            /**
             *  根据beanId创建Bean
             */
            createBean: function (beanId) {

            }.bind(this),
            /**
             * 判断bean的类型
             * @param beanVo 
             * @param result 
             */
            gengeBean: function (beanVo, result) {
                var className = beanVo.clazz;
                var factory = new ClassFacotry({
                    clazz: className
                });
                var params = [];
                var regExp = /^\$\{(.*)\}$/;
                // console.log(beanVo,beanVo.constructorArgs);
                for (var i = 0; i < beanVo.constructorArgs.length; i++) {
                    var arg = beanVo.constructorArgs[i];
                    if (regExp.test(arg)) {   //需要将${}转化成真实的变量值
                        arg = StringHelp.extractProerty(arg);
                        arg = this.findConfigvalue(arg);
                    }
                    params.push(arg);
                }
                var tempId = StringHelp.isSpace(beanVo.identifyId) ? "" : beanVo.identifyId;
                var clazzObj;
                if (!beanVo.isSingle && tempId === "") {    //判断是不是单列，并且identifyId未设置
                    if (StringHelp.isSpace(this._beanHash.get(beanVo.id))) {    //从hash中查看是否已经存在
                        clazzObj = {
                            params: params,
                            id: beanVo.id + tempId,
                            identifyId: beanVo.identifyId
                        };
                    } else {    //如果hash中已经存在，则添加一个时间戳，避免类的ID相同
                        clazzObj = {
                            params: params,
                            id: beanVo.id + (new Date()).getTime(),
                            identifyId: beanVo.identifyId
                        };
                    }
                    // console.log(clazzObj, beanVo.id);
                } else {
                    clazzObj = {
                        params: params,
                        id: beanVo.id + tempId,
                        identifyId: beanVo.identifyId
                    }
                }
                console.log(clazzObj);
                factory.newInstance(clazzObj, function (data) {
                    this.beanProcess(beanVo, data);
                    // console.log(data);
                    result(data);
                }.bind(this));
            },
            /**
             * bean处理函数
             * @param beanVo 
             * @param bean 
             */
            beanProcess: function (beanVo, bean) {
                //TODOSomething 暂时未做属性解析
                // console.log(beanVo, bean, beanVo.id);
                var reg = /^\$\{(.*)\}$/;
                if (!StringHelp.isSpace(beanVo.propertys)) {
                    for (var i = 0; i < beanVo.propertys.length; i++) {
                        var type = beanVo.propertys[i].type;
                        var name = beanVo.propertys[i].name;
                        var value = beanVo.propertys[i].value;
                        if (reg.test(value)) {
                            value = StringHelp.extractProerty(value);
                            value = this.findConfigvalue(value);
                        }
                        switch (type) {
                            case "ref":
                                var refIdentifyId = this._hash.get(value).identifyId;
                                ~function (bean, name, value, refIdentifyId) {
                                    this.getBean(value, refIdentifyId, function (data) {
                                        bean[name] = data;
                                    });
                                }.call(this, bean, name, value, refIdentifyId);
                                break;
                            case "number":
                                bean[name] = Number(value);
                                break;
                            default:
                                bean[name] = value;
                        }
                    }
                }

                if (bean !== null && bean.declaredClass === "com.huayun.framework.context.BaseContext") {
                    bean.set("hash", this.get("hash"));
                    bean.parentContext = this;
                    // console.log(bean);
                } else {
                    // console.log(bean, "beanProcess", beanVo.id,bean.startBean());
                    // console.log(beanVo.id,bean.startBean());
                    bean.context = this;
                    bean.startBean();
                    // console.log("========================================");
                }
            },
            /**
             * 获取bean的数据
             * @param beanId 
             * @param identifyId 
             * @param result 
             */
            getBean: function (beanId, identifyId, result) {
                // console.log("==========BaseContext getBean===========", beanId, this, this._hash.get(beanId));
                var bean = null;
                var declaredClass = this.declaredClass;
                // console.log(declaredClass);
                if (beanId === "baseContext" && declaredClass !== "com.huayun.framework.context.GlobalContext") {
                    return this;
                }
                if (!StringHelp.isSpace(this._hash.get(beanId))) {
                    var beanVo = this._hash.get(beanId);
                    // console.log("========getBean===****====", beanVo.id, beanVo.isSingle, identifyId);
                    if (!StringHelp.isSpace(identifyId)) {
                        beanVo.identifyId = identifyId;
                    }
                    if (beanVo.isSingle) {    //单例bean
                        // console.log(">>>单例--id:", beanVo.id);
                        if (this._singleCache[beanId]) {
                            bean = this._singleCache[beanId];
                        } else {
                            if (bean == null && this.parentContext) {//到父context里面找
                                // console.log("========到父context里面找===****====", beanVo.id, beanVo.isSingle);
                                bean = this.parentContext.lookUp(beanId);
                            }
                            if (StringHelp.isSpace(bean)) {//父context里面找，自己里面也找不到才真正创建
                                this.gengeBean(beanVo, function (data) {
                                    bean = data;
                                    this._singleCache[beanId] = bean;
                                    result(bean);
                                    if (bean == null && this.parentContext) {
                                        bean = this.parentContext.getBean(beanId, identifyId);
                                    }
                                    if (bean == null) {
                                        console.log("找不到对应的bean的定义：" + beanId);
                                    }
                                }.bind(this));
                            }
                        }
                    } else {    //非单例bean
                        // console.log(">>>非单例--id:", beanVo);
                        this.gengeBean(beanVo, function (data) {
                            bean = data;
                            // console.log(">>>非单例--bean:", bean.id,this._beanHash.get(beanId));
                            if (StringHelp.isSpace(this._beanHash.get(beanId))) {
                                this._beanHash.put(beanId, [bean]);
                                // console.log(">>>非单例--bean:", bean.id,this._beanHash.get(beanId));
                            } else {
                                this._beanHash.get(beanId).push(bean);
                            }
                            result(bean);
                            if (bean == null && this.parentContext) {
                                bean = this.parentContext.getBean(beanId, identifyId);
                            }
                            if (bean == null) {
                                console.log("找不到对应的bean的定义：" + beanId);
                            }

                        }.bind(this));
                    }
                } else {
                    console.log("找不到对应的bean的定义：" + beanId);
                }
            },
        
            getBeanEx: function (beanId, identifyId, callBack) {
                var beanVo = null;
                // console.log("getBeanEx===============", beanId, this);
                if (this.parentContext.declaredClass === "com.huayun.framework.context.GlobalContext") {
                    if (this._hash.get(beanId) !== null || this.parentContext.get("hash").get(beanId) !== null) {
                        // console.log(beanId);
                        beanVo = this._hash.get(beanId);
                        if (!beanVo) {
                            debugger;
                        }
                        // console.log(beanVo, beanId);
                        if (beanVo.type !== "module") {
                            this.getBean(beanId, identifyId, function (data) {
                                // console.log(data);
                                callBack(data);
                            });
                        }
                    } else {
                        console.error("对应的bean类型没有定义" + beanId);
                    }
                } else {
                    if (this._hash.get(beanId) !== null) {
                        beanVo = this._hash.get(beanId);
                        if (beanVo.type !== "module") {
                            this.getBean(beanId, identifyId, function (data) {
                                callBack(data);
                            });
                        }
                    } else {
                        console.error("对应的bean类型没有定义" + beanId);
                    }
                }
                // console.log(beanId, callBack, this.parentContext.declaredClass);
            },
            /**
             * 查找方法
             * @param beanId 
             */
            lookUp: function (beanId) {
                // console.log("lookUp:",this._beanHash);
                var bean = null;
                if (this._hash.containsKey(beanId)) {
                    // debugger;
                    // console.log(this._beanHash);
                    // console.log("=======lookUp======", this._hash.get(beanId).isSingle, beanId, this._beanHash);
                    if (this._hash.get(beanId).isSingle) {  //单例
                        bean = this._singleCache[beanId];
                    } else {    //非单例
                        if (this._beanHash.containsKey(beanId)) {
                            if (this._beanHash.get(beanId).length > 0) {
                                bean = this._beanHash.get(beanId)[0];
                            }
                        }
                    }
                }
                if (StringHelp.isSpace(bean) && this.parentContext) {
                    bean = this.parentContext.lookUp(beanId);
                }
                return bean;
            },
            /**
             * 根据ID查找，返回所有符合条件的bean实例
             * 不需要考虑单例情况，该方法不合适单例情况
             * @param beandId
             * @returns {*}
             */
            lookUpBeans: function (beandId) {
                var array = null;
                if (this._beanHash.containsKey(beandId)) {
                    array = this._beanHash.get(beandId);
                }
                if (this.parentContext) {
                    if (array == null || array.length === 0) {
                        array = this.parentContext.lookUpBeans(beandId);
                    }
                }
                return array;
            },
            /**
             * 根据ID查找，返回符合条件的单例
             * @param bendId 
             * @param identifyId 
             */
            lookUpOnlyOne: function (bendId, identifyId) {
                var bean = null;
                if (StringHelp.isSpace(identifyId)) {
                    bean = this.lookUp(bendId);
                } else {
                    var array = this.lookUpBeans(bendId);
                    if (array !== null) {
                        for (var i = 0; i < array.length; i++) {
                            var beanVo = this._hash.get(bendId);
                            if (beanVo.identifyId === identifyId) {
                                bean = array[i];
                                break;
                            }
                        }
                    }
                }
                if (bean === null && this.parentContext) {
                    bean = this.parentContext.lookUpOnlyOne(bendId, identifyId);
                }
                return bean;
            },
            /**
             * 注销bean实例，与lookUp方法对应
             */
            doRealease: function (bean) {
                var result = true;
                var id = this._getBeanId(bean);
                if (id === null && this.parentContext) {
                    this.parentContext.doRealease(bean);
                } else if (id !== null) {
                    var value = this._beanHash.get(id);
                    if (bean === value) {
                        this._beanHash.remove(id);
                    } else if (value.constructor === Array) {
                        var newArray = [];
                        for (var i = 0; i < value.length; i++) {
                            var theBean = value[i];
                            if (theBean === bean) {
                                result = false;
                            } else {
                                newArray.push(theBean);
                            }
                        }
                        this._beanHash.put(id, newArray);
                    }
                } else {
                    result = false;
                }
                return result;
            },
            /**
             * 注销多个bean实例，与lookUpBeans方法对应
             * @param list
             */
            doRealeaseBeans: function (list) {
                for (var i = 0; i < list.length; i++) {
                    var bean = list[i];
                    this.doRealease(bean);
                }
                return true;
            },
            /**
             * 通过key查找config中的value,直接用config.find()方法不会到父context中去寻找
             * @param key
             * @returns {*}
             */
            findConfigvalue: function (key) {
                var value;
                value = this._config.get(key);
                if (StringHelp.isSpace(value) && this.parentContext) {
                    value = this.parentContext.findConfigvalue(key);
                }
                return value;
            },
            /**
             * 获取beanId
             * @param bean
             * @returns {*}
             * @private
             */
            _getBeanId: function (bean) {
                var beanId = null;
                for (var i = 0; i < this._beanHash.size(); i++) {
                    var key = this._beanHash.getKeyList()[i];
                    var array = this._beanHash.get(key);
                    for (var j = 0; j < array.length; j++) {
                        var theBean = array[j];
                        if (bean === theBean) {
                            beanId = key;
                            break;
                        }
                    }
                }
                return beanId;
            }
        })
    }
);