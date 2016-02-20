import aws4 from 'aws4';
import geit from 'geit';

export default async function getCached(repo, ref='HEAD'){
    // in memoyr will be fine now
    const refs = await geit(repo).refs();
    const fullRef = refs[ref];

    return s3.get(`${repo}-${fullRef}`);
}
