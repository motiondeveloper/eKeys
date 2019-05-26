<!-- Links -->

[back to top ↑]: #ekeys-

<div align="center">

# eKeys <!-- omit in toc -->

An After Effects animation engine built for expressions.

**[Usage](#usage) | [Example](#example) | [Contact](#contact)**

![eKeys Usage Video](docs/static/ekeys-preview.jpg)

```javascript
const keys = [{keyTime: 0, keyValue: [0, 100], easeIn: 0, easeOut: 90}]
```

---

### [✨ Download eKeys ✨](https://github.com/motiondeveloper/eKeys/releases)<!-- omit in toc -->

---

</div>

## Overview

`eKeys` is a system of doing animation in Adobe After effects entirely within expressions, with the same level on control as keyframes.

It comes in the form of a JSON file that's imported into the project, and a set of expressions to be applied to each property you wish to animate, with the values for each 'keyframe' to be added in the expression.

Its purpose is to speed up the creation of After Effects templates and other automated work.

### Features

- Animate between numbers or arrays
- Full control over easing, including incoming and outgoing velocities
- No installation necessary, just import 1 file
- Simple and succinct expression interface
- Free and open source

## Contents

- [Overview](#overview)
  - [Features](#features)
- [Contents](#contents)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Example](#example)
- [Helpful Snippets](#helpful-snippets)
- [By animators, for animators](#by-animators-for-animators)
- [To Do](#to-do)
- [License](#license)
- [Contact](#contact)

## Compatibility

This version of eKeys is compatible with After Effects versions >= 16.0.1 (CC2019) which use the new [Javascript engine](https://helpx.adobe.com/after-effects/using/expression-language-reference.html).

For a legacy version that works in the ExtendScript engine, view the [ExtendScript Branch](https://github.com/motiondeveloper/ekeys/tree/extendscript). Please note, this version of `eKeys` is not actively maintained.

[Back To Top ↑]

## Usage

### 1. **Download and import `eKeys.jsx` into your After Effects project**

Head over to the [releases](https://github.com/motiondeveloper/eKeys/releases) page to download the latest version of the `eKeys.jsx` file.

This is the JSON file that contains the necessary code to run eKeys. You may not be able to drag and drop it into your project, in which case you will need to use the import dialog.

### 2. **Add a reference to the library in your expression**

To reference the library in an expression, you need to assign it to a variable. This is done via the line:

```javascript
const eKeys = footage('eKeys.jsx').sourceData;
```

> ⚠️ Since After Effects doesn't count footage items that are only referenced within expressions as used, it's recommended that you also place the `eKeys.jsx` file in any compositions where it is referenced.
>
> This will ensure After Effects includes the file when collecting assets or packaging into a Motion Graphics Template.

### 3. **Create an array of keyframes**

Each keyframe is represented as an object within an array.

```javascript
// Example keyframe array
const keys = [
  {
    keyTime: 1,
    keyValue: [0, 0],
    easeIn: 0,
    easeOut: 66,
  },{
    keyTime: 2,
    keyValue: [thisComp.width / 2, 0],
    easeIn: 90,
    easeOut: 0,
  }
];
```

<details><summary><strong>Keyframe Object Properties</strong></summary>
<br>

- `keyTime` Where the keyframe is in time, in seconds
  - Type: `number`
  - Required: `true`
- `keyValue` Value of the keyframe
  - Type: `number` or `array`
  - Required: `true`
- `easeIn` Ease in amount
  - Type: `number`
  - Required: `false`
  - Default: `33`
  - Range: `0-100`
- `easeOut` Ease out amount
  - Type: `number`
  - Required: `false`
  - Default: `33`
  - Range: `0-100`
- `velocityIn` Incoming speed
  - Type: `number`
  - Required: `false`
  - Default: `0`
  - Range: `0-100`
- `velocityOut` Outgoing speed
  - Type: `number`
  - Required: `false`
  - Default: `0`
  - Range: `0-100`
</details>
<br>

> While it is recommended you order the keyframes according to their `keyTime` for the sake of readability, it is not required as they are sorted before the animation is calculated.

### 4. **Create an Animation Group**

Animation groups are what animate between keyframes in an array:

```javascript
const animationGroupName = eKeys.AnimGroup(keys);
```

#### Animation Group Inputs

- `keys` Array of keyframes
  - Type: `array`
  - Required: `true`

You can create as many of these groups as you like, with separate keyframes in each group. This comes in handy when you need to toggle between different animations, while still having the ability to have them within the same expression.

### 5. **Animate the keyframe group**

The final animated value can be returned by calling the animGroup function.

```javascript
animationGroupName(time);
```
#### `animationGroup()` Function Inputs

- `time` Incrementing animation time
  - Type: `number`
  - Required: `true`

[Back To Top ↑]

## Example

An example setup of an animation group with a couple of keyframes:

```javascript
// Import eKeys library
const eKeys = footage('eKeys.jsx').sourceData;

// Create an array of keyframes
const inKeys = [
  {
    keyTime: 1,
    keyValue: 0,
    easeIn: 0,
    easeOut: 66,
  },{
    keyTime: 2,
    keyValue: 250,
    easeIn: 90,
    easeOut: 0,
  }
];

// Create new animation group
const animIn = eKeys.AnimGroup(inKeys);

// Animate animation group
animIn(time);
```

[Back To Top ↑]

## Helpful Snippets

- **Create default keyframe parameters**

  Use the JavaScript [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) to use a set of default parameters across keyframes.

  <details><summary>View Code</summary>
  <p>

  ```javascript
  const keyDefaults = {
    easeIn: 90,
    easeOut: 50,
    velocityIn: 10,
    velocityOut: 50,
  };

  const keys = [
    {
      keyTime: 0,
      keyValue: [0, 50],
      ...keyDefaults,
    },{
      keyTime: 2,
      keyValue: [800, 50],
      ...keyDefaults,
    }
  ];
  ```

  </p>
  </details>

- **Merge multiple keyframes groups**

  Easily merge multiple keyframe arrays to be animated using the JavaScript [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

    <details><summary>View Code</summary>
  <p>

  ```javascript
  const inKeys;
  const outKeys;
  const animOut = true;
  const keys = animOut ? [...inKeys] : [...inKeys, ...outKeys];
  const animGroup = eKeys.AnimGroup(keys);
  animGroup(time);
  ```

  </p>
  </details>

  This could also be done by creating multiple `AnimGroup's`.

- **Remove specific keyframes**

  Remove one or more keyframes based on another variable.

  <details><summary>View Code</summary>
    <p>

    ```javascript
    const keys;
    const enableSpin = true;
    if (!enableSpin) {
      // Remove keyframes 4 and 5
      keys.splice(3, 2);
    }
    ```

    </p>
    </details>

[Back To Top ↑]

## By animators, for animators

`eKeys` is built in such a way to make it easy for animators to use, based on the inputs and workflows they're used to when creating standard After Effects keyframes.

Outside of this context, `eKeys` might not make much sense or appear a little strange. It's not for everyone!

[Back To Top ↑]

## To Do

- [x] ~~Add incoming and outgoing velocity inputs~~
- [x] ~~Updated curve sampling to Newton-Raphson~~
- [x] ~~Update to Javascript engine (from ExtendScript)~~
- [x] ~~Input validation and error checking~~
- [ ] Add option to input easing as array, same as [css cubic-bezier](https://www.w3.org/TR/css-easing-1/).
- [ ] Add animation method input (overshoot, bounce etc)
- [ ] Add ability to write in standard js and transform into After Effects jsx using babel

[Back To Top ↑]

## License

This project is licensed under the terms of the GNU GPLv3 license. In summary:

> Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.

The `bezier` function is from [Gaëtan Renaudeau's cubic-bezier](https://github.com/gre/bezier-easing) project, and is licensed under the terms of the MIT License.

[Back To Top ↑]

## Contact

Bugs, issues and feature requests can be submitted by filing an [issue](https://github.com/motiondeveloper/ekeys/issues) on Github. For everything else, feel free to reach out to [@modeveloper](https://twitter.com/modeveloper) on twitter.

[Back To Top ↑]
