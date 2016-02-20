import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';

Promise.promisifyAll(fs);
export function pathExists(fp){
  var fn = typeof fs.access === 'function' ? fs.access : fs.stat;
	return new Promise(function (resolve) {
		fn(fp, function (err) {
			resolve(!err);
		});
	});
}

export {fs};

export async function sha1(filePath){
	const buff = await fs.readFile(filePath);
  	return crypto.createHash('sha1').update(data).digest('hex');
}
	
export function nextTick(fn){
  return new Promise(function(resolve){
    process.nextTick(resolve);
  });
}
