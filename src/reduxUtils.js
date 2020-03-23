// use selectors outside of react
// returns [result, resultChanged]
const wrapSelector = (selector, equalityFn) => {
  let last = null;
  const equal = equalityFn ? (a,b) => a === b || equalityFn(a,b) : (a,b) => a === b;
  return state => {
    const result = selector(state);
    if (!equal(result, last)) {
      last = result;
      return [result, true];
    } else {
      return [last, false];
    }
  }
};

// simple array equality
const arrayEqual = (a,b) => {
  if (a === undefined || b === undefined || a === null || b === null) return false;
  if (a.length !== b.length) return false;
  for (const index in a) {
    if (a[index] !== b[index]) return false;
  }
  return true;
};

// get changed elements in an array
// only call on two unequal arrays
// assumes at most 1 change occurs per update after first
// only reports inserts and updates (which is all that matters for many cases)
const arrayChanged = () => {
  let last = null;
  return array => {
    if (last === null) {
      last = array;
      return array;
    }

    let oldLength = last.length;
    let newLength = array.length;
    let changes;
    
    if (oldLength === 0) {
      // everything has changed compared to an empty array
      changes = array;
    } else if (newLength < oldLength) {
      // item removed
      changes = []
    } else {
      // item inserted or updated
      let posArray = newLength, posLast = oldLength;
      // move from end until mismatch
      while (array[posArray] === last[posLast]) {
        posArray--;
        posLast--;
      }
      changes = [array[posArray]]
    }
    last = array;
    return changes;
  }
};

export { wrapSelector, arrayEqual, arrayChanged };