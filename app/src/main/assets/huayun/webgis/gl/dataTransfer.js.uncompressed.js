define("com/huayun/webgis/gl/dataTransfer", [
    "require",
    "exports",
    "../layers/support/OverscaledTileID",
    "../layers/support/CanonicalTileID",
    "../layers/support/expression/Formatted",
    "../utils/Color",
    "../utils/image",
    "./GridIndex",
    "../data/ArrayType",
    "./SegmentVector",
    "../geometry/Anchor",
    "./ImagePosition",
    "./ImageAtlas"
], function (e, f, OverscaledTileID, CanonicalTileID, Formatted, Color, image,
             GridIndex, ArrayType, SegmentVector, Anchor, ImagePosition, ImageAtlas) {
    var registry = {};

    function register(name, klass, options) {
        if (options === void 0) options = {};

        (Object.defineProperty)(klass, '_classRegistryKey', {
            value: name,
            writeable: false
        });
        registry[name] = {
            klass: klass,
            omit: options.omit || [],
            shallow: options.shallow || []
        };
    }

    f.register = register;

    register('Object', Object);

    register('StructArrayLayout2i4', ArrayType.StructArrayLayout2i4);
    register('StructArrayLayout3ui6', ArrayType.StructArrayLayout3ui6);
    register('StructArrayLayout2ui4', ArrayType.StructArrayLayout2ui4);
    register('StructArrayLayout2i4ub8', ArrayType.StructArrayLayout2i4ub8);
    register('StructArrayLayout4i4ui16', ArrayType.StructArrayLayout4i4ui16);
    register('StructArrayLayout3f12', ArrayType.StructArrayLayout3f12);
    register('StructArrayLayout1ul4', ArrayType.StructArrayLayout1ul4);
    register('StructArrayLayout2i2i2i12', ArrayType.StructArrayLayout2i2i2i12);
    register('StructArrayLayout2ub2f12', ArrayType.StructArrayLayout2ub2f12);
    register('GlyphOffsetArray', ArrayType.GlyphOffsetArray);
    register('SymbolInstanceArray', ArrayType.SymbolInstanceArray);
    register('SymbolLineVertexArray', ArrayType.SymbolLineVertexArray);
    register('StructArrayLayout2f8', ArrayType.StructArrayLayout2f8);
    register('PlacedSymbolArray', ArrayType.PlacedSymbolArray);
    register('StructArrayLayout2i4i12', ArrayType.StructArrayLayout2i4i12);
    register('StructArrayLayout1f4', ArrayType.StructArrayLayout1f4);
    register('StructArrayLayout3i6', ArrayType.StructArrayLayout3i6);

    register('SegmentVector', SegmentVector);
    register("CollisionBoxArray", ArrayType.CollisionBoxArray);
    register('Grid', GridIndex);
    register('FeatureIndexArray', ArrayType.FeatureIndexArray);

    register('CanonicalTileID', CanonicalTileID);
    register('OverscaledTileID', OverscaledTileID, {omit: ['posMatrix']});


    register('Anchor', Anchor);

    register('ImagePosition', ImagePosition);
    register('ImageAtlas', ImageAtlas);

    register('Color', Color);


    register('AlphaImage', image.AlphaImage);
    register('RGBAImage', image.RGBAImage);
    register('Error', Error);


    function serialize(input, transferables) {
        if (input === null ||
            input === undefined ||
            typeof input === 'boolean' ||
            typeof input === 'number' ||
            typeof input === 'string' ||
            input instanceof Boolean ||
            input instanceof Number ||
            input instanceof String ||
            input instanceof Date ||
            input instanceof RegExp) {
            return input;
        }

        if (input instanceof ArrayBuffer) {
            if (transferables) {
                transferables.push(input);
            }
            return input;
        }

        if (ArrayBuffer.isView(input)) {
            var view = (input);
            if (transferables) {
                transferables.push(view.buffer);
            }
            return view;
        }

        if (input instanceof ImageData) {
            if (transferables) {
                transferables.push(input.data.buffer);
            }
            return input;
        }

        if (Array.isArray(input)) {
            var serialized = [];
            for (var i = 0, list = input; i < list.length; i += 1) {
                var item = list[i];

                serialized.push(serialize(item, transferables));
            }
            return serialized;
        }

        if (typeof input === 'object') {
            var klass = (input.constructor);
            var name = klass._classRegistryKey;
            if (!name) {
                // debugger;
                console.log(name);
                throw new Error("can't serialize object of unregistered class");
            }

            var properties = klass.serialize ?
                // (Temporary workaround) allow a class to provide static
                // `serialize()` and `deserialize()` methods to bypass the generic
                // approach.
                // This temporary workaround lets us use the generic serialization
                // approach for objects whose members include instances of dynamic
                // StructArray types. Once we refactor StructArray to be static,
                // we can remove this complexity.
                (klass.serialize(input, transferables)) : {};

            if (!klass.serialize) {
                for (var key in input) {
                    // any cast due to https://github.com/facebook/flow/issues/5393
                    if (!(input).hasOwnProperty(key)) {
                        continue;
                    }
                    if (registry[name].omit.indexOf(key) >= 0) {
                        continue;
                    }
                    var property = (input)[key];
                    properties[key] = registry[name].shallow.indexOf(key) >= 0 ?
                        property :
                        serialize(property, transferables);

                    // console.timeEnd("parse");
                }
                if (input instanceof Error) {
                    properties.message = input.message;
                }
            } else {
                // make sure statically serialized object survives transfer of $name property
            }

            if (properties.$name) {
                throw new Error('$name property is reserved for worker serialization logic.');
            }
            if (name !== 'Object') {
                properties.$name = name;
            }
            return properties;
        }

        throw new Error(("can't serialize object of type " + (typeof input)));
    }

    function deserialize(input) {
        if (input === null ||
            input === undefined ||
            typeof input === 'boolean' ||
            typeof input === 'number' ||
            typeof input === 'string' ||
            input instanceof Boolean ||
            input instanceof Number ||
            input instanceof String ||
            input instanceof Date ||
            input instanceof RegExp ||
            input instanceof ArrayBuffer ||
            ArrayBuffer.isView(input) ||
            input instanceof ImageData) {
            return input;
        }

        if (Array.isArray(input)) {
            return input.map(deserialize);
        }

        if (typeof input === 'object') {
            var name = (input).$name || 'Object';

            var ref = registry[name];
            if (ref === undefined) ;
            var klass = ref.klass;
            if (!klass) {
                throw new Error(("can't deserialize unregistered class " + name));
            }

            if (klass.deserialize) {
                return (klass.deserialize)(input);
            }

            var result = Object.create(klass.prototype);

            for (var i = 0, list = Object.keys(input); i < list.length; i += 1) {
                var key = list[i];

                if (key === '$name') {
                    continue;
                }
                var value = (input)[key];
                result[key] = registry[name].shallow.indexOf(key) >= 0 ? value : deserialize(value);
            }

            return result;
        }
        throw new Error(("can't deserialize object of type " + (typeof input)));
    }

    f.serialize = serialize;
    f.deserialize = deserialize;
});