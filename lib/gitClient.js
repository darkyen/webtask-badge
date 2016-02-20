// removed the original gitclient for this simple hack
import request from 'request';
import url from 'url';
import path from 'path';
import Promise from 'bluebird';
import {pathExists, fs} from './utils';
import extractAsync from './extractAsync';
// refs not supported yet.
export async function fetch(gitUrl, localDir) {
  
  // Most likely the file already exists.
  // if so just throw.
  const fullPathDir = path.join(localDir, 'git-temp');
  if( !await pathExists(fullPathDir) ) {
    await fs.mkdirAsync(fullPathDir)
  }

  return new Promise(function(resolve, reject){

    const parsed   = url.parse(gitUrl);
    const isGitLab = !!parsed.host.match(/gitlab/gi);
    
    if( !isGitLab && !parsed.host.match(/github/gi) ){
      return reject('Only Github or GitLab supported');
    }

    const repoPath = parsed.path.replace('.git', '') + ( isGitLab?'/repository/archive.zip' : '/archive/master.zip'); // clean url
    const finalURL = url.format({
      protocol: 'https',
      host: parsed.host,
      pathname: repoPath
    });

    const fullPathFile = path.join(fullPathDir, 'archive.zip')
    request
      .get(finalURL)
      .on('error', reject)
      .on('response', function(response){
        const status = response.statusCode;
        if( status !== 200 ){
          reject('Request failed'); 
        }
      })
      .pipe(fs.createWriteStream(fullPathFile, { flags: 'w+' }))
      .on('finish', e => resolve(fullPathFile));
  });
}

export async function clone(gitUrl, localDir){
  // we only support gitUrl's that archive.
  // the git client geit will not work on node 0.12.x
  // this will be replaced with geit.clone as soon as geit
  // webtask is updated.
  const localArchivePath = await fetch(gitUrl, localDir);
  return await extractAsync(localArchivePath, localDir);
}