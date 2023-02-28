/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/10
 *  @time   :   10:40
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/util/StringHelp", [], function () {
    return {
        /**
         * 判断字符串是否为空或者为null
         * @param value
         * @returns {boolean} 为空或者null时返回 true， 不为空或者null时返回false
         */
        isSpace: function (value) {
            if (value == null || value === "null") {
                return true;
            } else if (typeof value === "object") {
                // console.log(value,"+++++++++++++++++++++++++++++++++++++++++++++++++++",typeof value);
                return false;
            } else {
                var reg = /(^\s*)|(\s*$)/g;
                // console.log(value,"--------------------------------------------------",typeof value);
                if (value.replace(reg, "").length === 0) {
                    return true;
                }
                return !reg.test(value);
            }
        },
        /**
         *  判断两个字符是否相等,null 和""," " 都相等
         * @param str1
         * @param str2
         */
        isStrEqual: function (str1, str2) {
            var result = false;
            if (this.isSpace(str1) && this.isSpace(str2)) {
                result = true;
            } else if (str1 === str2) {
                result = true;
            }
            return result;
        },
        /**
         * 从${}中提提取内容 ,如果不包括{}，则返回原来的值
         * @param value
         */
        extractProerty: function (value) {
            var result;
            var reg = /^\$\{(.*)\}$/;
            var obj = reg.exec(value);
            if (obj === null) {
                result = value;
            } else {
                result = obj[1];
            }
            return result;
        }
    };
});