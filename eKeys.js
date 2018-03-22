// Expression Key constructor
function EKey(time, value, easeIn, easeOut) {
    this.time = framesToTime(time);
    this.value = value;
    this.easeIn = easeIn;
    this.easeOut = easeOut;
}

// Animation group constructor
function EKeys() {

    this.keys = [];

    this.add = function (time, value, easeIn, easeOut) {
        this.keys.push(new EKey(time, value, easeIn, easeOut));
    }

    this.anim = function () {

        var lastKeyNum = this.keys.length - 1;
        var lastKey = this.keys[lastKeyNum];

        // Check if time is outside of all keys
        if (time <= this.keys[0].time) {
            return this.keys[0].value;
        } else if (time >= lastKey.time) {
            return lastKey.value;

        // Otherwise animate between keys
        } else {

            curKeyNum = 0;

            // Set current key to most recent keyframe
            while (curKeyNum < lastKeyNum && time >= this.keys[curKeyNum + 1].time) {
                curKeyNum++
            }

            var curKey = this.keys[curKeyNum];
            var nextKey = this.keys[curKeyNum + 1];

            // Create easing spline based on current and next key
            var spline = new KeySpline(curKey.easeOut / 100, 0.0, 1 - (nextKey.easeIn / 100), 1)

            // Animation details
            var v1 = curKey.value;
            var v2 = nextKey.value

            var t1 = curKey.time;
            var t2 = nextKey.time;

            // Delta calculations
            var deltaV = v2 - v1;
            var deltaT = t2 - t1;

            // Move animation to t1
            var movedTime = time - t1;
            if (movedTime <= 0) {
                movedTime = 0;
            }

            // Map time to speed
            var timeInput = Math.min(1, movedTime / deltaT);

            // Get progress value according to spline
            var prg = spline.get(timeInput);

            // Animate between values according to progress amount
            return v1 + deltaV * prg
        }
    }
}

// Spline creation function
function KeySpline(mX1, mY1, mX2, mY2) {

    // Copyright (c) 2012 Gaetan Renaudeau <renaudeau.gaetan@gmail.com>
    // https://gist.githubusercontent.com/gre/1926947/raw/a577b568ac1b8931737442b0ac370d27978dc3b5/KeySpline.js

    this.get = function (aX) {
        if (mX1 == mY1 && mX2 == mY2) return aX; // linear
        return CalcBezier(GetTForX(aX), mY1, mY2);
    }

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
    function C(aA1) { return 3.0 * aA1; }

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function CalcBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function GetSlope(aT, aA1, aA2) {
        return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    function GetTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;
        for (var i = 0; i < 4; ++i) {
            var currentSlope = GetSlope(aGuessT, mX1, mX2);
            if (currentSlope == 0.0) return aGuessT;
            var currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
}
