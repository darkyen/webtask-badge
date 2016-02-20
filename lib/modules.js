var fs = require('fs');
var vr = require('verquire');
var assign = require('lodash/object/assign');
var versions = assign({}, vr.modules);

// This code was originally found at 
// https://github.com/tehsis/webtask-canirequire
// I ported it as per my requirements

function getPkgDep(depName){
  return JSON.parse(fs.readFileSync(__dirname + '/node_modules/' + depName + '/package.json'));
}

function getVersions(depName){
  return versions[depName];
}


function getTopModules(moduleDict, depName){
  if( getVersions(depName) ){
    return moduleDict;
  }

  // if they are not in verquire registry
  // there is most likely 1 single version
  var depObj = getPkgDep(depName);
  moduleDict[depName] = [depObj.version];
  return moduleDict;
}

function removeDot(dir) {
  // for .bin removals
  return dir[0] !== '.';
}


var mods = Object.keys(process.binding("natives"))
  .filter(function(nativeDep) {
    return nativeDep[0] !== '_';
  }).reduce(function(natives, native) {
    versions[native] = ['native'];
    return natives;
  }, {});


fs.readdirSync(__dirname + '/node_modules')
  .filter(removeDot)
  .reduce(getTopModules, versions);


// perhaps add few re-curring ones.
versions['webtask-tools'] = ['1.3.0'];
versions['verquire'] = ['0.2.6'];

console.log("Exporting versions");

export default versions;
