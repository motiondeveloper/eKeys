type keyVal = number | number[];

interface inputKey {
  keyTime: number;
  keyValue: keyVal;
  easeIn?: number;
  easeOut?: number;
  velocityIn?: number;
  velocityOut?: number;
}

interface eKey extends inputKey {
  easeIn: number;
  easeOut: number;
  velocityIn: number;
  velocityOut: number;
}

// The function that's called from After Effects
// as eKeys.animate()
function animate(inputKeyframes: inputKey[], inputTime: number) {
  // Validate function inputs
  checkTypes([
    ['.animate() input keyframes', inputKeyframes, 'array'],
    ['.animate() input time', inputTime, 'number'],
  ]);
  // Validate and sort the given keys
  const validKeys: eKey[] = inputKeyframes
    .map((key, index) => validateKeyframe(key, index))
    .sort((a, b) => a.keyTime - b.keyTime);

  return animateBetweenKeys(validKeys, inputTime);

  // Returns the final animated value
  // This is the function that's returned
  function animateBetweenKeys(keys: eKey[], time: number) {
    const lastKey: eKey = keys[keys.length - 1];
    const firstKey: eKey = keys[0];

    // If outside of all keys, return closest
    // key value, skip animation
    if (time <= firstKey.keyTime) {
      return firstKey.keyValue;
    }
    if (time >= lastKey.keyTime) {
      return lastKey.keyValue;
    }

    const curKeyNum: number = getCurrentKeyNum(keys, time);
    const curKey: eKey = keys[curKeyNum];
    const nextKey: eKey = keys[curKeyNum + 1];

    // Check to see if no animation is
    // required between current keys
    if (curKey.keyValue === nextKey.keyValue) {
      return curKey.keyValue;
    }

    // Create easing spline based on current and next key
    const easingCurve = bezier(
      curKey.easeOut / 100,
      curKey.velocityOut / 100,
      1 - nextKey.easeIn / 100,
      1 - nextKey.velocityIn / 100
    );

    // Incrementing time value that
    // starts from the current keyTime
    const movedTime: number = Math.max(time - curKey.keyTime, 0);

    // The total duration of the animation
    const animationLength: number = nextKey.keyTime - curKey.keyTime;

    // Animation progress amount between 0 and 1
    const linearProgress: number = Math.min(1, movedTime / animationLength);
    const easedProgress: number = easingCurve(linearProgress);

    // Animate between values according to
    // whether they are arrays
    if (Array.isArray(curKey.keyValue) && Array.isArray(nextKey.keyValue)) {
      return animateArrayFromProgress(
        curKey.keyValue,
        nextKey.keyValue,
        easedProgress
      );
    }
    if (
      typeof curKey.keyValue === 'number' &&
      typeof nextKey.keyValue === 'number'
    ) {
      return animateValueFromProgress(
        curKey.keyValue,
        nextKey.keyValue,
        easedProgress
      );
    }

    // If the keys aren't both arrays
    // or numbers, return an error
    throw Error(
      `Keyframe ${curKeyNum} and ${curKeyNum +
        1} must be of the same dimension. Received ${getType(
        curKey.keyValue
      )} and ${getType(nextKey.keyValue)}`
    );

    // Set current key to most recent keyframe
    function getCurrentKeyNum(keys: eKey[], time: number): number {
      const lastKeyNum = keys.length - 1;
      let curKeyNum = 0;
      while (curKeyNum < lastKeyNum && time >= keys[curKeyNum + 1].keyTime) {
        curKeyNum++;
      }
      return curKeyNum;
    }

    // Performs animation on each element of array individually
    function animateArrayFromProgress(
      startArray: number[],
      endArray: number[],
      progressAmount: number
    ): number[] {
      // Array Subtraction
      const arrayDelta = endArray.map(
        (item, index) => item - startArray[index]
      );
      // Multiply difference by progress
      const deltaProgressed = arrayDelta.map(item => item * progressAmount);
      // Add to current key and return
      return startArray.map((item, index) => item + deltaProgressed[index]);
    }

    // Animate between values according to progress
    function animateValueFromProgress(
      startVal: number,
      endVal: number,
      progressAmount: number
    ): number {
      const valueDelta = endVal - startVal;
      return startVal + valueDelta * progressAmount;
    }

    // Creates bezier curve and returns function
    // to calculate eased value
    function bezier(mX1: number, mY1: number, mX2: number, mY2: number) {
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

      const A = (aA1: number, aA2: number) => 1.0 - 3.0 * aA2 + 3.0 * aA1;
      const B = (aA1: number, aA2: number) => 3.0 * aA2 - 6.0 * aA1;
      const C = (aA1: number) => 3.0 * aA1;

      // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
      const calcBezier = (aT: number, aA1: number, aA2: number) =>
        ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;

      // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
      const getSlope = (aT: number, aA1: number, aA2: number) =>
        3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);

      const binarySubdivide = (
        aX: number,
        aA: number,
        aB: number,
        mX1: number,
        mX2: number
      ) => {
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
          Math.abs(currentX) > SUBDIVISION_PRECISION &&
          ++i < SUBDIVISION_MAX_ITERATIONS
        );
        return currentT;
      };

      const newtonRaphsonIterate = (
        aX: number,
        aGuessT: number,
        mX1: number,
        mX2: number
      ) => {
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

      const LinearEasing = (x: number) => x;

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

      const getTForX = (aX: number) => {
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
        const dist =
          (aX - sampleValues[currentSample]) /
          (sampleValues[currentSample + 1] - sampleValues[currentSample]);
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
          mX2
        );
      };

      const bezierEasing = (x: number) => {
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
  function validateKeyframe(key: inputKey, index: number): eKey {
    // Set keyframe defaults
    const {
      keyTime,
      keyValue,
      easeIn = 33,
      easeOut = 33,
      velocityIn = 0,
      velocityOut = 0,
    } = key;

    // Alert the user if an eKey is missing
    // the required arguments
    if (keyTime == null) {
      requiredArgumentError('keyValue', `keyframe ${index}`);
    }
    if (keyValue == null) {
      requiredArgumentError('keyValue', `keyframe ${index}`);
    }

    // Check data types of keyframe parameters
    checkTypes([
      [`Keyframe ${index} time`, keyTime, `number`],
      [`Keyframe ${index} value`, keyValue, [`number`, `array`]],
      [`Keyframe ${index} easeIn`, easeIn, `number`],
      [`Keyframe ${index} easeOut`, easeOut, `number`],
      [`Keyframe ${index} velocityIn`, velocityIn, `number`],
      [`Keyframe ${index} velocityOut`, velocityOut, `number`],
    ]);

    // Return validated keyframe
    const validKey: eKey = {
      keyTime,
      keyValue,
      easeIn,
      easeOut,
      velocityIn,
      velocityOut,
    };

    return validKey;
  }

  // Loops through an array of the format
  // [name, variable, 'expectedType']
  // and checks if each variable is of the expected type and
  // returns a TypeError if it's not
  type checking = [string, any, string | string[]];
  type checkingArray = checking[];
  function checkTypes(checkingArray: checkingArray) {
    checkingArray.map(checking => {
      const name: string = checking[0];
      const argumentType: string = getType(checking[1]);
      const expectedType: string | string[] = checking[2];
      if (!isValidType(argumentType, expectedType)) {
        typeErrorMessage(name, expectedType, argumentType);
      }
    });
  }

  // More reliable version of standard js typeof
  function getType(value: any) {
    return Object.prototype.toString
      .call(value)
      .replace(/^\[object |\]$/g, '')
      .toLowerCase();
  }

  // Error message template for an incorrect type
  function typeErrorMessage(
    variableName: string,
    expectedType: string | string[],
    receivedType: string
  ) {
    throw new TypeError(
      `${variableName} must be of type ${expectedType}. Received ${receivedType}`
    );
  }

  // Error message template for missing required argument
  function requiredArgumentError(variableName: string, functionName: string) {
    throw new Error(`${variableName} is required in ${functionName}`);
  }

  // Checks if a variable type matches the given expected type
  // expected type can be array of types
  function isValidType(argumentType: string, expectedType: string | string[]) {
    if (getType(expectedType) === 'string') {
      return argumentType === expectedType;
    }
    // Could also check using getType()
    // but then typescript would complain
    if (Array.isArray(expectedType)) {
      return expectedType.filter(type => argumentType === type).length > 0;
    }
    return typeErrorMessage(
      'The expected type',
      'string or array',
      getType(expectedType)
    );
  }
}

export { animate };
