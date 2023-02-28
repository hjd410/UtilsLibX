/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   14:37
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/thematicmap/tool/FileParseFromService", [
    "dojo/Deferred",
    "dojo/request",
    "../../util/JSONFormatterUtil",
    "../../vo/DataSourceVo",
    "../../vo/DiagramVo"
], function (Deferred, request, JSONFormatterUtil, DataSourceVo, DiagramVo) {
    function FileParseFromService() {
        this.url = "";
        this.styles = [];
    }

    FileParseFromService.prototype.getAll = function (config, resultFun, faultFun) {
        this.url = config.url;
        request(this.url).then.call(this,
            function (data) {
                var result = JSONFormatterUtil.string2Json(data);
                var dataSourceData = result.datasource.cat.dataSources.dataSource;
                if (!Array.isArray(dataSourceData)) {
                    dataSourceData = [dataSourceData];
                }
                var mapData = result.map.root;
                this.styles = result.style;
                resultFun({
                    dataSourceVo: new DataSourceVo(dataSourceData),
                    diagramVo: new DiagramVo(mapData, this.styles)
                });
            }.bind(this)
        );
    };
    return FileParseFromService;
});
