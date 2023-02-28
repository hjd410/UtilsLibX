define("com/huayun/webgis/layers/support/Interpolate", [
  "./UnitBezier",
  "../../utils/utils",
  "../../utils/Color"
], function (UnitBezier, utils, Color) {
  function number(a, b, t) {
    return (a * (1 - t)) + (b * t);
  }

  function color(from, to, t) {
    return new Color(
      number(from.r, to.r, t),
      number(from.g, to.g, t),
      number(from.b, to.b, t),
      number(from.a, to.a, t)
    );
  }

  function array$1(from, to, t) {
    return from.map(function (d, i) {
      return number(d, to[i], t);
    });
  }

  var interpolate = /*#__PURE__*/Object.freeze({
    number: number,
    color: color,
    array: array$1
  });

  function exponentialInterpolation(input, base, lowerValue, upperValue) {
    var difference = upperValue - lowerValue;
    var progress = input - lowerValue;

    if (difference === 0) {
      return 0;
    } else if (base === 1) {
      return progress / difference;
    } else {
      return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }
  }

  var Interpolate = function Interpolate(type, operator, interpolation, input, stops) {
    this.type = type;
    this.operator = operator;
    this.interpolation = interpolation;
    this.input = input;

    this.labels = [];
    this.outputs = [];
    for (var i = 0, list = stops; i < list.length; i += 1) {
      var ref = list[i];
      var label = ref[0];
      var expression = ref[1];

      this.labels.push(label);
      this.outputs.push(expression);
    }
  };

  Interpolate.interpolationFactor = function interpolationFactor(interpolation, input, lower, upper) {
    var t = 0;
    if (interpolation.name === 'exponential') {
      t = exponentialInterpolation(input, interpolation.base, lower, upper);
    } else if (interpolation.name === 'linear') {
      t = exponentialInterpolation(input, 1, lower, upper);
    } else if (interpolation.name === 'cubic-bezier') {
      var c = interpolation.controlPoints;
      var ub = new UnitBezier(c[0], c[1], c[2], c[3]);
      t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
    }
    return t;
  };

  Interpolate.parse = function parse(args, context) {
    var operator = args[0];
    var interpolation = args[1];
    var input = args[2];
    var rest = args.slice(3);

    if (!Array.isArray(interpolation) || interpolation.length === 0) {
      return context.error("Expected an interpolation type expression.", 1);
    }

    if (interpolation[0] === 'linear') {
      interpolation = {name: 'linear'};
    } else if (interpolation[0] === 'exponential') {
      var base = interpolation[1];
      if (typeof base !== 'number') {
        return context.error("Exponential interpolation requires a numeric base.", 1, 1);
      }
      interpolation = {
        name: 'exponential',
        base: base
      };
    } else if (interpolation[0] === 'cubic-bezier') {
      var controlPoints = interpolation.slice(1);
      if (
        controlPoints.length !== 4 ||
        controlPoints.some(function (t) {
          return typeof t !== 'number' || t < 0 || t > 1;
        })
      ) {
        return context.error('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.', 1);
      }

      interpolation = {
        name: 'cubic-bezier',
        controlPoints: (controlPoints)
      };
    } else {
      return context.error(("Unknown interpolation type " + (String(interpolation[0]))), 1, 0);
    }

    if (args.length - 1 < 4) {
      return context.error(("Expected at least 4 arguments, but found only " + (args.length - 1) + "."));
    }

    if ((args.length - 1) % 2 !== 0) {
      return context.error("Expected an even number of arguments.");
    }

    input = context.parse(input, 2, {kind: 'number'});
    if (!input) {
      return null;
    }

    var stops = [];

    var outputType = (null);
    if (operator === 'interpolate-hcl' || operator === 'interpolate-lab') {
      outputType = ColorType;
    } else if (context.expectedType && context.expectedType.kind !== 'value') {
      outputType = context.expectedType;
    }

    for (var i = 0; i < rest.length; i += 2) {
      var label = rest[i];
      var value = rest[i + 1];

      var labelKey = i + 3;
      var valueKey = i + 4;

      if (typeof label !== 'number') {
        return context.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
      }

      if (stops.length && stops[stops.length - 1][0] >= label) {
        return context.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.', labelKey);
      }

      var parsed = context.parse(value, valueKey, outputType);
      if (!parsed) {
        return null;
      }
      outputType = outputType || parsed.type;
      stops.push([label, parsed]);
    }

    if (outputType.kind !== 'number' &&
      outputType.kind !== 'color' &&
      !(
        outputType.kind === 'array' &&
        outputType.itemType.kind === 'number' &&
        typeof outputType.N === 'number'
      )
    ) {
      return context.error(("Type " + (toString(outputType)) + " is not interpolatable."));
    }

    return new Interpolate(outputType, (operator), interpolation, input, stops);
  };

  Interpolate.prototype.evaluate = function evaluate(ctx) {
    var labels = this.labels;
    var outputs = this.outputs;

    if (labels.length === 1) {
      return outputs[0].evaluate(ctx);
    }

    var value = ((this.input.evaluate(ctx)));
    if (value <= labels[0]) {
      return outputs[0].evaluate(ctx);
    }

    var stopCount = labels.length;
    if (value >= labels[stopCount - 1]) {
      return outputs[stopCount - 1].evaluate(ctx);
    }

    var index = utils.findStopLessThanOrEqualTo(labels, value);
    var lower = labels[index];
    var upper = labels[index + 1];
    var t = Interpolate.interpolationFactor(this.interpolation, value, lower, upper);

    var outputLower = outputs[index].evaluate(ctx);
    var outputUpper = outputs[index + 1].evaluate(ctx);

    if (this.operator === 'interpolate') {
      return (interpolate[this.type.kind.toLowerCase()])(outputLower, outputUpper, t); // eslint-disable-line import/namespace
    } else if (this.operator === 'interpolate-hcl') {
      return hcl.reverse(hcl.interpolate(hcl.forward(outputLower), hcl.forward(outputUpper), t));
    } else {
      return lab.reverse(lab.interpolate(lab.forward(outputLower), lab.forward(outputUpper), t));
    }
  };

  Interpolate.prototype.eachChild = function eachChild(fn) {
    fn(this.input);
    for (var i = 0, list = this.outputs; i < list.length; i += 1) {
      var expression = list[i];

      fn(expression);
    }
  };

  Interpolate.prototype.possibleOutputs = function possibleOutputs() {
    var ref;

    return (ref = []).concat.apply(ref, this.outputs.map(function (output) {
      return output.possibleOutputs();
    }));
  };

  Interpolate.prototype.serialize = function serialize() {
    var interpolation;
    if (this.interpolation.name === 'linear') {
      interpolation = ["linear"];
    } else if (this.interpolation.name === 'exponential') {
      if (this.interpolation.base === 1) {
        interpolation = ["linear"];
      } else {
        interpolation = ["exponential", this.interpolation.base];
      }
    } else {
      interpolation = ["cubic-bezier"].concat(this.interpolation.controlPoints);
    }

    var serialized = [this.operator, interpolation, this.input.serialize()];

    for (var i = 0; i < this.labels.length; i++) {
      serialized.push(
        this.labels[i],
        this.outputs[i].serialize()
      );
    }
    return serialized;
  };

  // dataTransfer.register();
  return Interpolate;
});