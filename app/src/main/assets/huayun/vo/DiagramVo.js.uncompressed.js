/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:35
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/DiagramVo", [
    "./EnvironmentVo",
    "./MapVo"
], function (EnvironmentVo, MapVo) {
    function DiagramVo(params, styles) {
        this.description = params.description;
        this.environmentVo = new EnvironmentVo(params.environment);
        this.mapVo = new MapVo(params.map, styles);
    }

    return DiagramVo;
});
