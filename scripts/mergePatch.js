// scripts/mergePatch.js

const _ = require("lodash");

function mergeAccountMemo(v1Memo, onboardingUpdates) {
  const v2Memo = _.cloneDeep(v1Memo);
  const changes = [];

  function deepMerge(target, source, path = "") {
    Object.keys(source).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;

      if (_.isPlainObject(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key], currentPath);
      } else {
        if (!_.isEqual(target[key], source[key])) {

  if (target[key] && source[key] && target[key] !== "" && target[key] !== null) {
    changes.push({
      field: currentPath,
      old: target[key],
      new: source[key],
      conflict: true
    });
  } else {
    changes.push({
      field: currentPath,
      old: target[key],
      new: source[key],
      conflict: false
    });
  }

  target[key] = source[key];
}
      }
    });
  }

  deepMerge(v2Memo, onboardingUpdates);

  return { v2Memo, changes };
}

module.exports = { mergeAccountMemo };