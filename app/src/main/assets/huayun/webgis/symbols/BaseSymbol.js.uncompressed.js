define("com/huayun/webgis/symbols/BaseSymbol", [], function () {
    function BaseSymbol(params) {
        this.minScale = 0;
        this.maxScale = 0;
        this.fixedSize = params.fixedSize || params.isFixed || true;
        this.fixed = {
            isFixed: this.fixedSize,
            addratio: 0
        }
    }

    return BaseSymbol;
});
