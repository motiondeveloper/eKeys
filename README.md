# 🔑 aeFunctions

**Keyframe animation in After Effects Expressions**

---

✨ View more details on our website: **[motiondeveloper.com/tools/eKeys](www.motiondeveloper.com/tools/ekeys)**

---

- Animate dynamically with expressions
- Full control over easing
- Simple and keyframe-like API

---

🏗 This project was created with [create-expression-lib](https://github.com/motiondeveloper/create-expression-lib) - our utility for creating and managing After Effects `.jsx` libraries.

---

## Setup

1. Download the latest version from the [releases](https://github.com/motiondeveloper/ekeys/releases) page.
2. Import it into After Effects

## Expression

Usage:

```js
const { animate } = footage('eKeys.jsx').sourceData;
animate([
  {
    keyTime: 0,
    keyValue: [0, 0],
    easeOut: 90,
  }, {
    keyTime: 3,
    keyValue: [960, 540],
    easeIn: 80,
  }
]);
```

## Development

1. **Clone project locally**

   ```sh
   git clone https://github.com/motiondeveloper/eKeys.git
   cd aeFunctions
   ```

2. **Start Rollup**

   Start Rollup in watch mode to automatically refresh your code as you make changes, by running:

   ```sh
   npm run watch
   ```

   _You can run also run a once off build:_ `npm run build`

3. **Edit the `src` files**

   _The `index.ts` contains an example expression setup._

   Any values exported from this file will be included in your library, for example:

   ```js
   export { someValue };
   ```

4. **Import the `dist` file into After Effects**

   Use the compiled output file as you would any other `.jsx` library. Any changes to the `src` files will be live updated, and After Effects will update the result of your expression.
