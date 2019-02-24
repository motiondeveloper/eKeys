# eKeys

eKeys is a system of doing animation in Adobe After effects entirely within expressions, with the same level on control as keyframes. It comes in the form of a JSON file that's imported into the project, and a set of expressions to be applied to each property you wish to animate, with the values for each "keyframe" to be added in the expression.

Its purpose is to speed up the creation of After Effects templates and other automated work.

## Usage

1. **Download and import [`eKeys.jsx`](https://github.com/motiondeveloper/eKeys/raw/master/eKeys.jsx) into your After Effects project**

   This is the JSON file that contains the necesary code to run eKeys. You may not be able to drag and drop it into your project, in which case you will need to use the import dialog.

   **Note:** eKeys is only compatable with After Effects versions >= 15.1.

2. **Add a refrence to the library in your expression**

   To refrence the library in an expression, you need to assign it to a variable. This is done via the line:

   ```javascript
   var eKeys = footage("eKeys.jsx").sourceData;
   ```

3. **Create an Animation Group**

   Animation groups are collections of keyframes, and are created with the line:

   ```javascript
   var animationGroupName = new eKeys.AnimGroup();
   ```

   You can create as many of these groups as you like, with separate keyframes in each group. This comes in handy when you need to toggle between different animations, while still having the ability to have them within the same expression.

4. **Add Keframes to the Animation Group**

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
    animationGroupName.anim();
    ````

The main advantage is that every property of a keyframe (it's time, value and easing) is set via expressions. This means they can easily be controlled and linked to other properties, a must when doing any sort of templating or automation within after effects.

## Example

An example setup of an animation group with a couple of keyframes:

```javascript
// Import eKeys library
var eKeys = footage("eKeys.jsx").sourceData;

// Create new animation group
var animIn = new eKeys.AnimGroup();

// Add keyframes to group
animIn.add(1, 0, 33, 80);
animIn.add(2, thisComp.width/2, 80, 33);

// Animate animation group
animIn.anim();
```

## To Do

- [x] ~~Add incoming and outgoing velocity inputs~~
- [x] ~~Updated curve sampling to Newton-Raphson~~
- [ ] Update to Javascript engine (from ExtendScript)
- [ ] Input validation and error checking
- [ ] Add animation method input (overshoot, bounce etc)

## License

This project is licensed under the terms of the GNU GPLv3 license. In summary:

> Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.

## Contact

Bugs, issues and feature requests can be submitted by filing an [issue](https://github.com/motiondeveloper/ekeys/issues) on Github. For everything else, feel free to reach out to [@modeveloper](https://twitter.com/modeveloper) on twitter.