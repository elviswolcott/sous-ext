const _findClass = (classList) => {
  return (target) => {
    for (const className of classList) {
      const found = document.getElementsByClassName(className);
      if (found.length > 0) return found;
    }
    return null;
  };
};

// manages all of the finders and transcribers
class Detector {
  constructor() {
    this.detectorsByName = {};
    this.allDetectors = [];
  }
  // register a module
  // most common & highest priority should be registered first for speed
  register({ name, ...config }) {
    this.allDetectors.push(name);
    let finder;
    // create finder function if needed
    if (config.find && config.classes) {
      const naive = _findClass(config.classes);
      finder = (target) => {
        return naive(target) || config.finder(target);
      };
    } else if (config.find) {
      finder = config.find;
    } else if (config.classes) {
      finder = _findClass(config.classes);
    } else {
      throw new Error(
        "Cannot register a module without a finder function or class"
      );
    }
    this.detectorsByName[name] = {
      find: finder,
      transcribe: config.transcribe,
    };
  }
  // unregister a module
  unregister(name) {
    this.allDetectors = this.allDetectors.filter(
      (detector) => detector !== name
    );
    delete this.detectorsByName[name];
  }
  // find a recipe inside the target
  find(target) {
    // for speed, only run until first positive
    for (const detector of this.allDetectors) {
      const found = this.detectorsByName[detector].find(target);
      if (found) {
        return {
          foundBy: detector,
          target: found,
        };
      }
    }
  }
  // extract a recipe inside the target
  transcribe({ foundBy, target }) {
    // for speed, only run until first positive
    return this.detectorsByName[foundBy].transcribe(target);
  }
}

export default Detector;
