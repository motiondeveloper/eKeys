// The function that's called from After Effects
// as eKeys.animate()
function animate(inputKeyframes, inputTime) {
    // Validate function inputs
    checkTypes([
        ['.animate() input keyframes', inputKeyframes, 'array'],
        ['.animate() input time', inputTime, 'number'],
    ]);
    // Validate and sort the given keys
    var validKeys = inputKeyframes
        .map(function (key, index) { return validateKeyframe(key, index); })
        .sort(function (a, b) { return a.keyTime - b.keyTime; });
    return animateBetweenKeys(validKeys, inputTime);
    // Returns the final animated value
    // This is the function that's returned
    function animateBetweenKeys(keys, time) {
        var lastKey = keys[keys.length - 1];
        var firstKey = keys[0];
        // If outside of all keys, return closest
        // key value, skip animation
        if (time <= firstKey.keyTime) {
            return firstKey.keyValue;
        }
        if (time >= lastKey.keyTime) {
            return lastKey.keyValue;
        }
        var curKeyNum = getCurrentKeyNum(keys, time);
        var curKey = keys[curKeyNum];
        var nextKey = keys[curKeyNum + 1];
        // Check to see if no animation is
        // required between current keys
        if (curKey.keyValue === nextKey.keyValue) {
            return curKey.keyValue;
        }
        // Create easing spline based on current and next key
        var easingCurve = bezier(curKey.easeOut / 100, curKey.velocityOut / 100, 1 - nextKey.easeIn / 100, 1 - nextKey.velocityIn / 100);
        // Incrementing time value that
        // starts from the current keyTime
        var movedTime = Math.max(time - curKey.keyTime, 0);
        // The total duration of the animation
        var animationLength = nextKey.keyTime - curKey.keyTime;
        // Animation progress amount between 0 and 1
        var linearProgress = Math.min(1, movedTime / animationLength);
        var easedProgress = easingCurve(linearProgress);
        // Animate between values according to
        // whether they are arrays
        if (Array.isArray(curKey.keyValue) && Array.isArray(nextKey.keyValue)) {
            return animateArrayFromProgress(curKey.keyValue, nextKey.keyValue, easedProgress);
        }
        if (typeof curKey.keyValue === 'number' &&
            typeof nextKey.keyValue === 'number') {
            return animateValueFromProgress(curKey.keyValue, nextKey.keyValue, easedProgress);
        }
        // If the keys aren't both arrays
        // or numbers, return an error
        throw Error("Keyframe " + curKeyNum + " and " + (curKeyNum +
            1) + " must be of the same dimension. Received " + getType(curKey.keyValue) + " and " + getType(nextKey.keyValue));
        // Set current key to most recent keyframe
        function getCurrentKeyNum(keys, time) {
            var lastKeyNum = keys.length - 1;
            var curKeyNum = 0;
            while (curKeyNum < lastKeyNum && time >= keys[curKeyNum + 1].keyTime) {
                curKeyNum++;
            }
            return curKeyNum;
        }
        // Performs animation on each element of array individually
        function animateArrayFromProgress(startArray, endArray, progressAmount) {
            // Array Subtraction
            var arrayDelta = endArray.map(function (item, index) { return item - startArray[index]; });
            // Multiply difference by progress
            var deltaProgressed = arrayDelta.map(function (item) { return item * progressAmount; });
            // Add to current key and return
            return startArray.map(function (item, index) { return item + deltaProgressed[index]; });
        }
        // Animate between values according to progress
        function animateValueFromProgress(startVal, endVal, progressAmount) {
            var valueDelta = endVal - startVal;
            return startVal + valueDelta * progressAmount;
        }
        // Creates bezier curve and returns function
        // to calculate eased value
        function bezier(mX1, mY1, mX2, mY2) {
            /**
             * https://github.com/gre/bezier-easing
             * BezierEasing - use bezier curve for transition easing function
             * by Gaëtan Renaudeau 2014 - 2015 – MIT License
             */
            // These values are established by empiricism with tests (tradeoff: performance VS precision)
            var NEWTON_ITERATIONS = 4;
            var NEWTON_MIN_SLOPE = 0.001;
            var SUBDIVISION_PRECISION = 0.0000001;
            var SUBDIVISION_MAX_ITERATIONS = 10;
            var kSplineTableSize = 11;
            var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
            var float32ArraySupported = typeof Float32Array === 'function';
            var A = function (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; };
            var B = function (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; };
            var C = function (aA1) { return 3.0 * aA1; };
            // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
            var calcBezier = function (aT, aA1, aA2) {
                return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
            };
            // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
            var getSlope = function (aT, aA1, aA2) {
                return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
            };
            var binarySubdivide = function (aX, aA, aB, mX1, mX2) {
                var currentX;
                var currentT;
                var i = 0;
                do {
                    currentT = aA + (aB - aA) / 2.0;
                    currentX = calcBezier(currentT, mX1, mX2) - aX;
                    if (currentX > 0.0) {
                        aB = currentT;
                    }
                    else {
                        aA = currentT;
                    }
                } while (Math.abs(currentX) > SUBDIVISION_PRECISION &&
                    ++i < SUBDIVISION_MAX_ITERATIONS);
                return currentT;
            };
            var newtonRaphsonIterate = function (aX, aGuessT, mX1, mX2) {
                for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                    var currentSlope = getSlope(aGuessT, mX1, mX2);
                    if (currentSlope === 0.0) {
                        return aGuessT;
                    }
                    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                    aGuessT -= currentX / currentSlope;
                }
                return aGuessT;
            };
            var LinearEasing = function (x) { return x; };
            if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
                throw new Error('bezier x values must be in [0, 1] range');
            }
            if (mX1 === mY1 && mX2 === mY2) {
                return LinearEasing;
            }
            // Precompute samples table
            var sampleValues = float32ArraySupported
                ? new Float32Array(kSplineTableSize)
                : new Array(kSplineTableSize);
            for (var i = 0; i < kSplineTableSize; ++i) {
                sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            }
            var getTForX = function (aX) {
                var intervalStart = 0.0;
                var currentSample = 1;
                var lastSample = kSplineTableSize - 1;
                for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                    intervalStart += kSampleStepSize;
                }
                --currentSample;
                // Interpolate to provide an initial guess for t
                var dist = (aX - sampleValues[currentSample]) /
                    (sampleValues[currentSample + 1] - sampleValues[currentSample]);
                var guessForT = intervalStart + dist * kSampleStepSize;
                var initialSlope = getSlope(guessForT, mX1, mX2);
                if (initialSlope >= NEWTON_MIN_SLOPE) {
                    return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
                }
                if (initialSlope === 0.0) {
                    return guessForT;
                }
                return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
            };
            var bezierEasing = function (x) {
                if (x === 0) {
                    return 0;
                }
                if (x === 1) {
                    return 1;
                }
                return calcBezier(getTForX(x), mY1, mY2);
            };
            return bezierEasing;
        }
    }
    // Make sure that a given keyframe is valid
    // Sets defaults and checks for errors
    function validateKeyframe(key, index) {
        // Set keyframe defaults
        var keyTime = key.keyTime, keyValue = key.keyValue, _a = key.easeIn, easeIn = _a === void 0 ? 33 : _a, _b = key.easeOut, easeOut = _b === void 0 ? 33 : _b, _c = key.velocityIn, velocityIn = _c === void 0 ? 0 : _c, _d = key.velocityOut, velocityOut = _d === void 0 ? 0 : _d;
        // Alert the user if an eKey is missing
        // the required arguments
        if (!keyTime) {
            requiredArgumentError('keyValue', "keyframe " + index);
        }
        if (!keyValue) {
            requiredArgumentError('keyValue', "keyframe " + index);
        }
        // Check data types of keyframe parameters
        checkTypes([
            ["Keyframe " + index + " time", keyTime, "number"],
            ["Keyframe " + index + " value", keyValue, ["number", "array"]],
            ["Keyframe " + index + " easeIn", easeIn, "number"],
            ["Keyframe " + index + " easeOut", easeOut, "number"],
            ["Keyframe " + index + " velocityIn", velocityIn, "number"],
            ["Keyframe " + index + " velocityOut", velocityOut, "number"],
        ]);
        // Return validated keyframe
        var validKey = {
            keyTime: keyTime,
            keyValue: keyValue,
            easeIn: easeIn,
            easeOut: easeOut,
            velocityIn: velocityIn,
            velocityOut: velocityOut
        };
        return validKey;
    }
    function checkTypes(checkingArray) {
        checkingArray.map(function (checking) {
            var name = checking[0];
            var argumentType = getType(checking[1]);
            var expectedType = checking[2];
            if (!isValidType(argumentType, expectedType)) {
                typeErrorMessage(name, expectedType, argumentType);
            }
        });
    }
    // More reliable version of standard js typeof
    function getType(value) {
        return Object.prototype.toString
            .call(value)
            .replace(/^\[object |\]$/g, '')
            .toLowerCase();
    }
    // Error message template for an incorrect type
    function typeErrorMessage(variableName, expectedType, receivedType) {
        throw new TypeError(variableName + " must be of type " + expectedType + ". Received " + receivedType);
    }
    // Error message template for missing required argument
    function requiredArgumentError(variableName, functionName) {
        throw new Error(variableName + " is required in " + functionName);
    }
    // Checks if a variable type matches the given expected type
    // expected type can be array of types
    function isValidType(argumentType, expectedType) {
        if (getType(expectedType) === 'string') {
            return argumentType === expectedType;
        }
        // Could also check using getType()
        // but then typescript would complain
        if (Array.isArray(expectedType)) {
            return expectedType.filter(function (type) { return argumentType === type; }).length > 0;
        }
        return typeErrorMessage('The expected type', 'string or array', getType(expectedType));
    }
}
