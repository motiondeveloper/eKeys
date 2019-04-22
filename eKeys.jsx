{
  'AnimGroup': function() {

    // Type checking functions
    const getType = (value) => {
      return Object.prototype.toString.call(value)
        .replace(/^\[object |\]$/g, '').toLowerCase();
    };

    const typeErrorMessage = (variableName, expectedType, receivedType) => {
      throw new TypeError(`${variableName} must be of type ${expectedType}. Received ${receivedType}`);
    }

    const isValidType = (argumentType, expectedType) => {
      if (getType(expectedType) === 'string') {
        return argumentType === expectedType;
      } else if (getType(expectedType) === 'array') {
        return expectedType.filter(type => argumentType === type);
      } else {
        typeErrorMessage(expectedType, 'string or array', getType(expectedType));
      }
    }

    const validateArgument = (argumentVariable, expectedType) => {
      const argumentType = getType(argumentVariable);
      return (isValidType(argumentType, expectedType)) ? true : typeErrorMessage(argumentVariable, expectedType, argumentType);
    }

    const checkTypes = (args, types) => {
      types.map((type, index) => {
        validateArgument(args[index], type);
      });
    }

    this.keys = [];

    // Keyframe object constructor
    function EKey(
      keyTime,
      keyValue,
      easeIn,
      easeOut,
      velocityIn,
      velocityOut,
    ) {
      this.time = keyTime;
      this.value = keyValue;
      this.easeIn = easeIn;
      this.easeOut = easeOut;
      this.velocityIn = velocityIn;
      this.velocityOut = velocityOut;
    }

    this.add = function addKeyframe(
      keyTime,
      value,
      easeIn = 33,
      easeOut = 33,
      velocityIn = 0,
      velocityOut = 0,
    ) {
      const argumentsArray = Array.prototype.slice.call(arguments, 0);
      checkTypes(argumentsArray, ['number', ['number', 'array'], 'number', 'number', 'number', 'number']);
      this.keys.push(
        new EKey(keyTime, value, easeIn, easeOut, velocityIn, velocityOut),
      );
    };

    /**
     * https://github.com/gre/bezier-easing
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     */

    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    const NEWTON_ITERATIONS = 4;
    const NEWTON_MIN_SLOPE = 0.001;
    const SUBDIVISION_PRECISION = 0.0000001;
    const SUBDIVISION_MAX_ITERATIONS = 10;

    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    const float32ArraySupported = typeof Float32Array === 'function';

    const A = (aA1, aA2) => 1.0 - 3.0 * aA2 + 3.0 * aA1;
    const B = (aA1, aA2) => 3.0 * aA2 - 6.0 * aA1;
    const C = aA1 => 3.0 * aA1;

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    const calcBezier = (aT, aA1, aA2) => ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    const getSlope = (aT, aA1, aA2) => 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);

    const binarySubdivide = (aX, aA, aB, mX1, mX2) => {
      let currentX;
      let currentT;
      let i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (
        Math.abs(currentX) > SUBDIVISION_PRECISION
        && ++i < SUBDIVISION_MAX_ITERATIONS
      );
      return currentT;
    };

    const newtonRaphsonIterate = (aX, aGuessT, mX1, mX2) => {
      for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
          return aGuessT;
        }
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    };

    const LinearEasing = x => x;

    const bezier = (mX1, mY1, mX2, mY2) => {
      if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
      }

      if (mX1 === mY1 && mX2 === mY2) {
        return LinearEasing;
      }

      // Precompute samples table
      const sampleValues = float32ArraySupported
        ? new Float32Array(kSplineTableSize)
        : new Array(kSplineTableSize);
      for (let i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }

      const getTForX = (aX) => {
        let intervalStart = 0.0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;

        for (
          ;
          currentSample !== lastSample && sampleValues[currentSample] <= aX;
          ++currentSample
        ) {
          intervalStart += kSampleStepSize;
        }
        --currentSample;

        // Interpolate to provide an initial guess for t
        const dist = (aX - sampleValues[currentSample])
          / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        if (initialSlope === 0.0) {
          return guessForT;
        }
        return binarySubdivide(
          aX,
          intervalStart,
          intervalStart + kSampleStepSize,
          mX1,
          mX2,
        );
      };

      return bezierEasing = (x) => {
        if (x === 0) {
          return 0;
        }
        if (x === 1) {
          return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
      };
    };

    this.anim = function animateBetweenKeys(time) {
      const lastKeyNum = this.keys.length - 1;
      const lastKey = this.keys[lastKeyNum];

      // Check if time is outside of all keys
      if (time <= this.keys[0].time) {
        return this.keys[0].value;
      }
      if (time >= lastKey.time) {
        return lastKey.value;
      }
      // Otherwise animate between keys
      let curKeyNum = 0;

      // Set current key to most recent keyframe
      while (curKeyNum < lastKeyNum && time >= this.keys[curKeyNum + 1].time) {
        curKeyNum++;
      }

      const curKey = this.keys[curKeyNum];
      const nextKey = this.keys[curKeyNum + 1];

      // Create easing spline based on current and next key
      const easingCurve = bezier(
        curKey.easeOut / 100,
        curKey.velocityOut / 100,
        1 - nextKey.easeIn / 100,
        1 - nextKey.velocityIn / 100,
      );

      // Delta calculations
      const deltaT = nextKey.time - curKey.time;
      
      // Move animation to t1
      const movedTime = Math.max(time - curKey.time, 0);
      
      // Map time to speed
      const timeInput = Math.min(1, movedTime / deltaT);
      
      // Get progress value according to spline
      const progress = easingCurve(timeInput);
      
      // Performs animation on each element of array individually
      const animateArrayFromProgress = (startArray, endArray, progressAmount) => {
        // Array Subtraction
        const arrayDelta = endArray.map((item, index) => {
          return item - startArray[index];
        });
        // Multiply difference by progress
        const deltaProgressed = arrayDelta.map(item => item * progressAmount);
        // Add to current key and return
        return startArray.map((item, index) => {
          return item + deltaProgressed[index];
        });
      }
      // Animate between values according to progress
      const animateValueFromProgress = (startVal, endVal, progressAmount) => {
        const valueDelta = endVal - startVal;
        return startVal + valueDelta * progressAmount;
      }

      // Animate according to whether values are an array
      const animateProps = [curKey.value, nextKey.value, progress];
      return (Array.isArray(curKey.value) || Array.isArray(nextKey).value) ?
        animateArrayFromProgress(...animateProps) :
        animateValueFromProgress(...animateProps);
    };
  }
}
