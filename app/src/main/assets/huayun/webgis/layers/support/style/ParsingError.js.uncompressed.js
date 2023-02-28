define("com/huayun/webgis/layers/support/style/ParsingError", [], function () {
    function ParsingError(key, message) {
        Error.call(this, message);
        this.message = message;
        this.key = key;
    }

    if (Error) ParsingError.__proto__ = Error;
    ParsingError.prototype = Object.create(Error && Error.prototype);
    ParsingError.prototype.constructor = ParsingError;

    return ParsingError;
})