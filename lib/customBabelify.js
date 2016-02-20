var babel = require('babel');
import clone from 'clone';
import through from 'through';
import path from 'path';

// Copyright (c) 2015 Sebastian McKenzie

// MIT License

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// @TODO: Move this to dependencies.
function regexify(val, escape) {
  if (!val) {
    return /.^/;
  }

  if (typeof val === 'string') {
    escape = escape || false;

    if (escape) {
      val = require('escape-string-regexp')(val);
    }
    return new RegExp(val);
  }

  if (require('util').isRegExp(val)) {
    return val;
  }

  throw new TypeError('illegal type: ' + val + ' for regexpify');
}

function arrayify(collection, options) {
  if (typeof collection === 'string') return (options && options.query ? toArray(document.querySelectorAll(collection)) : [collection])
  if (typeof collection === 'undefined') return []
  if (collection === null) return [null]
  if (typeof window != 'undefined' && collection === window) return [window]
  if (Array.isArray(collection)) return collection.slice()
  if (typeof collection.length != 'number') return [collection]
  if (typeof collection === 'function') return [collection]
  if (collection.length === 0) return []
  var arr = []
  for (var i = 0; i < collection.length; i++) {
    if (collection.hasOwnProperty(i) || i in collection) {
      arr.push(collection[i])
    }
  }
  if (arr.length === 0) return [collection]
  return arr
}
// this will use the source babel for
// compression
const browserify = function(f,o){
  return browserify.configure(o)(f);
}

browserify.configure = (opts) => {
   opts = opts || {};
   console.log(opts);

   if (opts.sourceMap !== false) opts.sourceMap = "inline" ;
   if (opts.extensions) opts.extensions = arrayify(opts.extensions);
   opts.ignore = regexify(opts.ignore);
   if (opts.only) opts.only = regexify(opts.only);

   return function (filename) {
     console.log("Transpiling", filename);
     if (opts.ignore.test(filename) || (opts.only && !opts.only.test(filename)) || !babel.canCompile(filename, opts.extensions)) {
       return through();
     }

     if (opts.sourceMapRelative) {
       filename = path.relative(opts.sourceMapRelative, filename);
     }

     var data = "";

     var write = function (buf) {
       data += buf;
     };

     var end = function () {
       var opts2 = clone(opts);
       delete opts2.sourceMapRelative;
       delete opts2.extensions;
       delete opts2.global;
       opts2.filename = filename;

       try {
         var out = babel.transform(data, opts2).code;
       } catch(err) {
         stream.emit("error", err);
         stream.queue(null);
         return;
       }

       stream.queue(out);
       stream.queue(null);
     };

     var stream = through(write, end);
     return stream;
   };
}

export default browserify;
