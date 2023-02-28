define("com/huayun/thematicmap/tool/Treedata", [
    'dojo/_base/declare'
], function(declare) {
    return declare("com.huayun.thematicmap.tool.Treedata", null, {
        constructor: function() {

        },

        /**
         * 将数据简单处理
         */
        getParentData: function (dic, dev) {
            var treeData = {};
            for(var i = 0; i < dev.length; i++) {
                var classId = dev[i].classId;
                for(var j = 0; j < dic.length; j++) {
                    if(dic[j]["CLASS_ID"] === classId) {
                        if(!treeData.hasOwnProperty(dic[j]['CLASS_DESC'])){
                            treeData[dic[j]['CLASS_DESC']] = [];
                            treeData[dic[j]['CLASS_DESC']].push(dev[i]);
                        }else {
                            treeData[dic[j]['CLASS_DESC']].push(dev[i]);
                        }
                    }
                }
            }
            // console.log(treeData);
            // return this.getTreeData(treeData);
            return treeData;
        },

        /*
         * 获取树形结构
         */
        getTreeData: function (data) {
            var lastData = {};
            lastData['identifier'] = 'name';
            lastData['label'] = 'name';
            lastData['items'] = [];
            for(var item in data) {
                var levelOne = {};
                levelOne.name = item;
                levelOne.children = [];
                for(var i = 0; i < data[item].length; i++) {
                    var levelTwo = {};
                    if(data[item][i].name === ""){
                        levelTwo.name = "none"+i;
                    }else {
                        levelTwo.name = data[item][i].name;
                    }
                    levelTwo.devId = data[item][i].devId;
                    levelOne.children.push(levelTwo);
                }
                lastData.items.push(levelOne);
            }
            return lastData;
        }
    });
});