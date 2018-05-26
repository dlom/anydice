anydice.js
==========

[![npm](https://img.shields.io/npm/v/anydice.svg)](https://www.npmjs.com/package/anydice)

Note: AnyDice is not particularly _fast_; results can take a second or two to come back

## API

### Simple

```javascript
const { roll } = require("anydice");
// import { roll } from "anydice";

// later...

console.log(await roll("output [highest 1 of 2d20]+10"));
```

### Advanced

```javascript
const { AnyDice } = require("anydice");

// later...

const input = `output [highest 1 of 2d20]+10
output 3d6 named "result 2"`;

const result = await AnyDice.run(input);
const rolls = result.roll(result.first(), 10); // [highest 1 of 2d20]+10
const possibleValues = result.possibleValues("result 2"); // 3d6
console.log(rolls);
console.log(possibleValues);
```
