define("com/huayun/webgis/Attribute", [], function () {
    function Attribute() {
        this.name = "";
        this.value = null;
    }

    Attribute.prototype.clone = function () {
        var attribute = new Attribute();
        attribute.name = this.name;
        attribute.value = this.value;
        return attribute;
    };

    return Attribute;
});
