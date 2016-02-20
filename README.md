# webtask-badge

This is proof of concept of [Webtask Everywhere](https://github.com/auth0/webtask-everywhere) working purely on server, with minor changes. It uses Babel 5 at the moment, and can compile modules with relatively shallow dependencies for webtask on webtask. So in short this is a webtask that creates webtask on webtask. This was deployed to webtask using itself! 

If you haven't checked out [webtask](https://webtask.io/), do it! It is incredible :D

## Current API 

```
path:   /compile/
method: GET 
params: 
  src : Github or Gitlab url
  type: 'repo'
```  

Note: Your package.json needs an `x-webtask` field set for the origin of your webtask, or this will just use the file linked at `main` or `/index.js` in the source repository.

## Cool use cases.
- Add a badge to your git repository with webtask code that lets a user deploy this code to their own tenant.
- Add this as a git-hook and let a webtask build your webtask on a git push.

## Known issues 
Modules with extremely deep dependency trees will not compile. It hits the 35 second time limit, but only when this is running on webtask. 

## What happens ?
1. The task creates a unqiue directory in `/tmp`
2. It fetches the git repository using archived.zip (Geit fails on node 0.12.6 :-/ or else I would have used geit clone --- geit is an smart-http client for git that runs in node)
3. It reads the package json and figures out the dependencies that will be missing in the sandbox.
4. Installs only the missing dependencies.
5. Runs browserify with sandbox dependencies as externals.
6. Transpiles the code using babel 5.
7. Uglifies and minifies the output.
8. Sends back the package to you.
9. You can create a webtask using the file.
10. You deploy it using webtask cli.

## Why I made this ?
I originally wanted to use plivo for an example to learn using webtask, and didn't find it in the sandbox. So I thought how cool would it be to have a webtask that compiles webtask in the webtask environment. This built itself as well as [Plivo Example](https://github.com/darkyen/hello-webtask). While doing this I learnt a lot about webtask and its environment. Essentially this was hacked in 2 days (or late coffee filled eye soring nights)!

## Future additions / Plans
- An interface.
- Zip and Direct file support.
