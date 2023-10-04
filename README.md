# gd-save
A JS library to read and edit the GD savefile quickly.

# Notes
Currently, this only works for Windows. Feel free to make a PR that adds support to other platforms.

# Usage
```js
const LevelReader = require('./gd-save');
(async () => {
  const level = await new LevelReader("my level name") // leave first argument empty to edit newest level
  console.log(level.data); // Inspect level data (e.g. level name and raw and decoded level string)
  level.add("1,1,2,15,3,15;") // adds levelstring to level
  level.save(); // saves edited level
})();
```
