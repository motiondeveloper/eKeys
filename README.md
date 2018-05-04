# eKeys

eKeys is a system of doing animation in Adobe After effects entirely within expressions, with the same level on control as keyframes. It comes in the form of an expression to be applied to each property you wish to animate, with the values for each "keyframe" to be added in the expression.

Its purpose is to speed up the creation of After Effects templates and other automated work.

## Usage

1. **Copy the required code from the `eKeys.js` file into the expression**

2. **Create an Animation Group**

   Animation groups are collections of keyframes, and are created with the line:

   ```javascript
   var animationGroupName = new EKeys();
   ```

   You can create as many of these groups as you like, with seperate keyframes in each group. This comes in handy when you need to toggle between different animations, while still having the ability to have them within the same expression.

3. **Add Keframes to the Animation Group**

   Each eKey must be added to a specific animation group, with the syntax of:

   ```javascript
   animationGroupName.add(keyTime, keyValue, easeIn, easeOut);
   ```

   - keyTime: Where the keyframe is in time, in frames
   - keyValue: Value of the keyframe
   - easeIn: Ease in amount [0-100]
   - easeOut: Ease out amount [0-100]

   The expression also supports custom incoming and outgoing velocities (via setting the y value of the easing curve tangents), but for the sake of input simplicity they are currently not accessible. A incoming and outgoing velocity of 0 is used.

4. **Animate the keyframe group**

    The keyframe group animation is called via the line:

    ```javascript
    animationGroupName.anim();
    ````


The main advantage is that every property of a keyframe (it's time, value and easing) is set via expressions. This means they can easily be controlled and linked to other properties, a must when doing any sort of templating or automation within after effects.

## Example

An example setup of an animation group with a couple of keyframes:

```javascript
// Create new animation group
var eAnimation = new EKeys();

// Add keyframes to group
eAnimation.add(25, 0, 33, 80);
eAnimation.add(50, thisComp.width/2, 80, 33);

// Animate animation group
eAnimation.anim();
```

## Limitations

* The expression has only currently been tested with 1-dimensional properties
* There is no input validation or error checking
* Strange results are produced when very steep easing curves are used due to the curve sampling method used (dichotomic search)

## License

This project is licensed under the terms of the MIT license.

## Contact

If you have any questions, feedback or anything else feel free to contact me at:

```
tim@haywood.org
```
