<!-- Links -->
[Back To Top ↑]: #ekeys

<div align="center">

# eKeys

An After Effects animation engine built for expressions.

**[Usage](#usage) | [Example](#example) | [Contact](#contact)**

---

</div>

## Overview

`eKeys` is a system of doing animation in Adobe After effects entirely within expressions, with the same level on control as keyframes.

It comes in the form of a JSON file that's imported into the project, and a set of expressions to be applied to each property you wish to animate, with the values for each 'keyframe' to be added in the expression.

Its purpose is to speed up the creation of After Effects templates and other automated work.

## Contents

- [eKeys](#ekeys)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Compatibility](#compatibility)
  - [Usage](#usage)
  - [Example](#example)
  - [To Do](#to-do)
  - [License](#license)
  - [Contact](#contact)

## Compatibility

This version of eKeys is compatible with After Effects versions >= 16.0.1 (CC2019) which use the new [Javascript engine](https://helpx.adobe.com/after-effects/using/expression-language-reference.html).

For a legacy version that works in the ExtendScript engine, view the [ExtendScript Branch](https://github.com/motiondeveloper/ekeys/tree/extendscript). Please note, this version of `eKeys` is not actively maintained.

[Back To Top ↑]

## Usage

1. **Download and import [`eKeys.jsx`](https://github.com/motiondeveloper/eKeys/raw/master/eKeys.jsx) into your After Effects project**

   This is the JSON file that contains the necessary code to run eKeys. You may not be able to drag and drop it into your project, in which case you will need to use the import dialog.

2. **Add a reference to the library in your expression**

   To reference the library in an expression, you need to assign it to a variable. This is done via the line:

   ```javascript
   const eKeys = footage("eKeys.jsx").sourceData;
   ```

3. **Create an Animation Group**

   Animation groups are collections of keyframes, and are created with the line:

   ```javascript
   const animationGroupName = new eKeys.AnimGroup();
   ```

   You can create as many of these groups as you like, with separate keyframes in each group. This comes in handy when you need to toggle between different animations, while still having the ability to have them within the same expression.

4. **Add Keyframes to the Animation Group**

   Each eKey must be added to a specific animation group, with the syntax of:

   ```javascript
   animationGroupName.add(keyTime, keyValue, easeIn, easeOut, velocityIn, velocityOut);
   ```

   - keyTime: Where the keyframe is in time, in seconds
   - keyValue: Value of the keyframe (can be value or array)
   - easeIn: Ease in amount [0-100]
   - easeOut: Ease out amount [0-100]
   - (Optional) velocityIn: Incoming speed [0-100]
   - (Optional) velocityOut: Outgoing speed [0-100]

5. **Animate the keyframe group**

    The keyframe group animation is called via the line:

    ```javascript
    animationGroupName.anim(time);
    ````

    - time: The time to animate according to, in seconds

The main advantage is that every property of a keyframe (it's time, value and easing) is set via expressions. This means they can be controlled and linked to other properties, a must when doing any sort of template creation or automation within after effects.

[Back To Top ↑]

## Example

An example setup of an animation group with a couple of keyframes:

```javascript
// Import eKeys library
const eKeys = footage("eKeys.jsx").sourceData;

// Create new animation group
const animIn = new eKeys.AnimGroup();

// Add keyframes to group
animIn.add(1, 0, 33, 80);
animIn.add(2, thisComp.width/2, 80, 33);

// Animate animation group
animIn.anim(time);
```

[Back To Top ↑]

## To Do

- [x] ~~Add incoming and outgoing velocity inputs~~
- [x] ~~Updated curve sampling to Newton-Raphson~~
- [x] ~~Update to Javascript engine (from ExtendScript)~~
- [ ] Input validation and error checking
- [ ] Add animation method input (overshoot, bounce etc)

[Back To Top ↑]

## License

This project is licensed under the terms of the GNU GPLv3 license. In summary:

> Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.

[Back To Top ↑]

## Contact

Bugs, issues and feature requests can be submitted by filing an [issue](https://github.com/motiondeveloper/ekeys/issues) on Github. For everything else, feel free to reach out to [@modeveloper](https://twitter.com/modeveloper) on twitter.

[Back To Top ↑]