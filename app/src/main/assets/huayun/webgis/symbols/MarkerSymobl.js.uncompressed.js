define(
    "com/huayun/webgis/symbols/MarkerSymobl", [
        "dojo/_base/declare",
        "./BaseSymbol"
    ], function (declare, BaseSymbol) {
        return declare("com.huayun.webgis.symbols.MarkerSymbol", [BaseSymbol], {
            minScale: 0,
            maxScale: 0,
            fixedSize: false,
            loaded: false,
            scale: 1


        });
    }
);