import DZip from 'decompress-zip'
export default function extractFile(archivePath, openedPath){
  return new Promise((resolve, reject) => {
    var unzipper = new DZip(archivePath);
    unzipper.on('error', reject);
    unzipper.on('extract', resolve);
    unzipper.extract({path: openedPath});
  });
}
