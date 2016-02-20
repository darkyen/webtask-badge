import cp from 'child_process';
import Promise from 'bluebird';
import path from 'path';
// Async Execute Wrapper 
function executeAsync(cmd, cwd){
  console.log('Running in', cmd, 'in', cwd);
  return new Promise((resolve, reject) => {
    cp.exec(cmd, {cwd: cwd}, function(err, stdout, stderr){
      if( err ){
        console.log(stderr, err);
        err.extra = stderr;
        reject(err);
      }
      // nothing to do with stdout here
      resolve({});
    });
  });
}


// Call npm install and install modules
export default async function installDependencies(deps, where, cache, tmp){
  if( deps.length === 0 ){
    return;
  }
  const npmCommand   = ['npm', 'install', ...deps].join(' ');
  return await executeAsync(npmCommand, where);
}

