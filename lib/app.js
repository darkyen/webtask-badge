import Express from 'express';
import bodyParser from 'body-parser';
import Promise from 'bluebird';
import os from 'os';
import {clone} from './gitClient';
import installDependencies from './installDependencies';
import resolveDependencies from './resolveDependencies';
import customBabelify from './customBabelify';
import path from 'path';
import compressCode from './compressCode';
import bundle from './bundle';
import {pathExists, fs} from './utils';
import uuid from 'uuid';
import rimraf from 'rimraf';

const app = Express();
const tmp = os.tmpdir();
const npmTmpDir    = path.join(tmp, 'webtask-badge', 'npm-temp');
const npmCacheDir  = path.join(tmp, 'webtask-badge', 'npm-cache');
const npmTmpConf   = `temp=${npmTmpDir}`;
const npmCacheConf = `cache=${npmCacheDir}`;
const npmEnvConf   = `production=true`;
const npmrc = [npmTmpConf, npmCacheConf, npmEnvConf].join('\n');

app.use(bodyParser.json());


app.get('/compile', async function (req, res){
  const {src, type, transpile} = req.query;
  const dirPath = path.join(tmp, uuid.v4());
  try{
    // If this fails, well :-/
    // add permissions - LINUX!
    await fs.mkdirAsync(dirPath);
    const bundleDir  = path.join(dirPath, 'bundle');
    const bundlePath = path.join(bundleDir, repoName + '.js');
    let entryPath = '';

    // identify the file, we have
    // by different strategies.
    // we will see if we have the 
    // file already on server.
    let id = '';
    try{
      switch(type){
        case 'repo':
          console.log('Fetching git repository in', dirPath);
          await clone(src, dirPath);
          // because of the known bug in the DZip We have to visit and find the first child.
          // which should be 1 (since this a git repo)
          const repoName = (await fs.readdirAsync(dirPath)).filter(k => k !== 'git-temp')[0];

          if( !repoName ){
            res.json({
              status: 400,
              details: 'Invalid archive'
            });
          }

          console.log("Git initialization finished");
          entryPath   = path.join(dirPath, repoName);
        break;
        case 'zip':
          //TODO: Implement this.
        break;

        case 'file':
          //Todo implement this.
        break;
        default:
          return res.json({
            error: 400,
            details: 'Unsupported packaging, only file, git repo or zip supported'
          });
      }      
    }catch(e){
      console.log("Fetching Error");
      console.log(e);
      return res.json({
        status: 400,
        details: 'Bad Request, please check the url or the package'
      });
    }

    const pkJsonPath = path.join(entryPath,'package.json');
    if( ( type === 'repo' || type === 'zip' ) && !(await pathExists(pkJsonPath))){
        res.json({
          status: 400,
          message: 'Package.json not found in the ' + type,
        });
    }

    // remove babelrc if present
    // this is temporary, i intend to support babel6
    try{
      console.log("Removing babelrc");
      await fs.unlinkAsync(path.join(entryPath, '.babelrc'));        
    }catch(e){
      // do nothing it didn't exist 
    }

    console.log("Reading package.json");
    const pkg = JSON.parse(await fs.readFileAsync(pkJsonPath));
    const entryPoint = path.join(entryPath, pkg['x-webtask'] || pkg.main || 'index.js');
    // Some packages do not have any dependencies
    // we explicitely need to handle them.
    const dependencies = Object.assign({}, pkg.dependencies);
    const {unresolved, resolved} = resolveDependencies(dependencies);      
    console.log("Install dependencies in ", entryPath );
    const npmRcPath = path.join(entryPath, '.npmrc');
    try{
      await fs.writeFileAsync(npmRcPath, npmrc, { mode: '0600' });
      await installDependencies(unresolved, entryPath);
    }catch(e){
      console.log("Failed client dependencies error");
      return res.json({
        status: 400,
        details: 'Unable to install dependencies',
        meta: {
          errorData: JSON.stringify(e),
          type: 'npm'
        }
      });
    }

    console.log("NPM install finished");
    console.log("going with entry path", entryPath);
    console.log("ignoring", resolved);

    const transforms = [
      customBabelify.configure({
        experimental: true,
        stage: 0
      })
    ];

    let output = '';
    
    await fs.mkdirAsync(bundleDir);
    try{
      const buff = await bundle(entryPoint, repoName.toLowerCase(), resolved, transforms);
      // uglify fails silently if the input is not utf8
      await fs.writeFileAsync(bundlePath + 'debug', buff.toString('utf8'));
      output = compressCode(buff.toString('utf8'));
    }catch(e){
      console.log("Failed client code error");
      console.log(e);
      return res.json({
        status: 400,
        details: 'Unable to minify',
        meta: {
          errorData: JSON.stringify(e),
          type: 'code'
        }
      })
    }

    await fs.writeFileAsync(bundlePath, output);
    res.sendFile(bundlePath);
    // await rimrafAsync(dirPath);
  }catch(e){
    console.log(e);
    await rimrafAsync(dirPath);
    return res.json({ 
      status: 500, 
      details: 'Internal Server Error' 
    });
  }
});

export default app;
