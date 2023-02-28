define("com/huayun/webgis/utils/rtlTextPlugin", ["exports"], function (exports) {

    var pluginRequested = false;
    var pluginURL = null;
    var foregroundLoadComplete = false;

    var plugin = {
        applyArabicShaping: null,
        processBidirectionalText: null,
        processStyledBidirectionalText: null,
        isLoaded: function isLoaded() {
            return foregroundLoadComplete ||       // Foreground: loaded if the completion callback returned successfully
                plugin.applyArabicShaping != null; // Background: loaded if the plugin functions have been compiled
        }
    };
})