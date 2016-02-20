import modules from './modules';
import semver from 'semver';


// only check for exact version atm
// ignore everything else
function hasDependency(name, version){
  return !!modules[name] && semver.maxSatisfying(modules[name], version);
}

export default function resolveDependencies(dependencies, dirPath){
  const depList = Object.keys(dependencies).map((name) => {
    const version = dependencies[name];
    return {name, version};
  });


  // need to do this because many modules
  // like babel for instance just wont compile
  // and webtask-tools etc aren't visible
  const unresolved = [], resolved = [];
  for(let dep of depList){
      if( !hasDependency(dep.name, dep.version) ){
        unresolved.push(`${dep.name}@${dep.version}`);
        continue;
      }
      resolved.push(dep.name);
  }

  return {unresolved, resolved};
}
