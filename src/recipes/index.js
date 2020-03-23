/* detects and scrapes recipes on a page */
import wprm  from './wprm';
import Detector from './detector';

const detector = new Detector();
//detector.register(wprm);

[wprm].forEach(m => { detector.register(m) });

export { detector };