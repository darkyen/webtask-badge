// extremely important, if you want to use
// es7 async await then inject the runtime
// here.
import 'babel/polyfill';

// Import the app from lib
import app from '../lib/app';

// import the webtask tools lib
import WebTask from 'webtask-tools';

console.log("Now creating server");
// export it es6 style, the module
// will be standalone browserified
// so it will work in all environments
// hence you don't have to worry about the .default
export default WebTask.fromExpress(app);