import Promise from 'bluebird';
import browserify from 'browserify';

export default function bundle(entryPath, moduleName,modulesToIgnore, transforms){
  // this will also force
  // browserify to use native modules straight from
  // node and not provide any builtins this significantly
  // reduces the package size.
  return new Promise(function(resolve, reject){
    const bundler = browserify(entryPath, {
      standalone: moduleName,
      detectGlobals: false,
      ignoreMissing: true,
      browserField: false,
      builtins: {},
    }).on('error', reject);

    for( let i = 0; i < modulesToIgnore.length; i++ ){
      bundler.external(modulesToIgnore[i]);
    }

    for( let i = 0; i < transforms.length; i++ ){
      bundler.transform(transforms[i]);
    }


    bundler.bundle((err, buff) => {
      if( err ){
        reject(err);
      }
      resolve(buff);
    });

  });
}