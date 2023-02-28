define("com/huayun/webgis/layers/support/SourceFeatureState", [
    "../../utils/utils"
], function (utils) {
    var SourceFeatureState = function SourceFeatureState() {
        this.state = {};
        this.stateChanges = {};
        this.deletedStates = {};
    };

    SourceFeatureState.prototype.updateState = function updateState(sourceLayer, featureIds, newState) {
        for (var i = 0; i < featureIds.length; i++) {
            var featureId = featureIds[i];
            var feature = String(featureId);
            this.stateChanges[sourceLayer] = this.stateChanges[sourceLayer] || {};
            this.stateChanges[sourceLayer][feature] = this.stateChanges[sourceLayer][feature] || {};
            utils.extend(this.stateChanges[sourceLayer][feature], newState);

            if (this.deletedStates[sourceLayer] === null) {
                this.deletedStates[sourceLayer] = {};
                for (var ft in this.state[sourceLayer]) {
                    if (ft !== feature) {
                        this.deletedStates[sourceLayer][ft] = null;
                    }
                }
            } else {
                var featureDeletionQueued = this.deletedStates[sourceLayer] && this.deletedStates[sourceLayer][feature] === null;
                if (featureDeletionQueued) {
                    this.deletedStates[sourceLayer][feature] = {};
                    for (var prop in this.state[sourceLayer][feature]) {
                        if (!newState[prop]) {
                            this.deletedStates[sourceLayer][feature][prop] = null;
                        }
                    }
                } else {
                    for (var key in newState) {
                        var deletionInQueue = this.deletedStates[sourceLayer] && this.deletedStates[sourceLayer][feature] && this.deletedStates[sourceLayer][feature][key] === null;
                        if (deletionInQueue) {
                            delete this.deletedStates[sourceLayer][feature][key];
                        }
                    }
                }
            }
        }
    };

    SourceFeatureState.prototype.removeFeatureState = function removeFeatureState(sourceLayer, featureId, key) {
        var sourceLayerDeleted = this.deletedStates[sourceLayer] === null;
        if (sourceLayerDeleted) {
            return;
        }

        var feature = String(featureId);

        this.deletedStates[sourceLayer] = this.deletedStates[sourceLayer] || {};

        if (key && featureId !== undefined && featureId >= 0) {
            if (this.deletedStates[sourceLayer][feature] !== null) {
                this.deletedStates[sourceLayer][feature] = this.deletedStates[sourceLayer][feature] || {};
                this.deletedStates[sourceLayer][feature][key] = null;
            }
        } else if (featureId !== undefined && featureId >= 0) {
            var updateInQueue = this.stateChanges[sourceLayer] && this.stateChanges[sourceLayer][feature];
            if (updateInQueue) {
                this.deletedStates[sourceLayer][feature] = {};
                for (key in this.stateChanges[sourceLayer][feature]) {
                    this.deletedStates[sourceLayer][feature][key] = null;
                }

            } else {
                this.deletedStates[sourceLayer][feature] = null;
            }
        } else {
            this.deletedStates[sourceLayer] = null;
        }

    };

    SourceFeatureState.prototype.getState = function getState(sourceLayer, featureId) {
        var feature = String(featureId);
        var base = this.state[sourceLayer] || {};
        var changes = this.stateChanges[sourceLayer] || {};

        var reconciledState = utils.extend({}, base[feature], changes[feature]);

        //return empty object if the whole source layer is awaiting deletion
        if (this.deletedStates[sourceLayer] === null) {
            return {};
        } else if (this.deletedStates[sourceLayer]) {
            var featureDeletions = this.deletedStates[sourceLayer][featureId];
            if (featureDeletions === null) {
                return {};
            }
            for (var prop in featureDeletions) {
                delete reconciledState[prop];
            }
        }
        return reconciledState;
    };

    SourceFeatureState.prototype.initializeTileState = function initializeTileState(tile, painter) {
        tile.setFeatureState(this.state, painter);
    };

    SourceFeatureState.prototype.coalesceChanges = function coalesceChanges(tiles, painter) {
        //track changes with full state objects, but only for features that got modified
        var featuresChanged = {};

        for (var sourceLayer in this.stateChanges) {
            this.state[sourceLayer] = this.state[sourceLayer] || {};
            var layerStates = {};
            for (var feature in this.stateChanges[sourceLayer]) {
                if (!this.state[sourceLayer][feature]) {
                    this.state[sourceLayer][feature] = {};
                }
                utils.extend(this.state[sourceLayer][feature], this.stateChanges[sourceLayer][feature]);
                layerStates[feature] = this.state[sourceLayer][feature];
            }
            featuresChanged[sourceLayer] = layerStates;
        }

        for (var sourceLayer$1 in this.deletedStates) {
            this.state[sourceLayer$1] = this.state[sourceLayer$1] || {};
            var layerStates$1 = {};

            if (this.deletedStates[sourceLayer$1] === null) {
                for (var ft in this.state[sourceLayer$1]) {
                    layerStates$1[ft] = {};
                    this.state[sourceLayer$1][ft] = {};
                }
            } else {
                for (var feature$1 in this.deletedStates[sourceLayer$1]) {
                    var deleteWholeFeatureState = this.deletedStates[sourceLayer$1][feature$1] === null;
                    if (deleteWholeFeatureState) {
                        this.state[sourceLayer$1][feature$1] = {};
                    } else {
                        for (var i = 0, list = Object.keys(this.deletedStates[sourceLayer$1][feature$1]); i < list.length; i += 1) {
                            var key = list[i];

                            delete this.state[sourceLayer$1][feature$1][key];
                        }
                    }
                    layerStates$1[feature$1] = this.state[sourceLayer$1][feature$1];
                }
            }

            featuresChanged[sourceLayer$1] = featuresChanged[sourceLayer$1] || {};
            utils.extend(featuresChanged[sourceLayer$1], layerStates$1);
        }

        this.stateChanges = {};
        this.deletedStates = {};

        if (Object.keys(featuresChanged).length === 0) {
            return;
        }

        for (var id in tiles) {
            var tile = tiles[id];
            tile.setFeatureState(featuresChanged, painter);
        }
    };

    return SourceFeatureState;
});