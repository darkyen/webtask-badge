import UglifyJS from 'uglify-js';
import Promise from 'bluebird';
import {nextTick} from './utils';

// process.nextTick for rescue, uglifyjs is extremely 
// resource intensive we need a back off function.
// @TODO: cleverify this!
export default async function compressCode(code){
  const ast = UglifyJS.parse(code);

  await nextTick();
  ast.figure_out_scope();

  await nextTick();
  ast.compute_char_frequency();

  await nextTick();
  ast.mangle_names();

  //Uglify without console.
  await nextTick();
  const comp = UglifyJS.Compressor({
    drop_console: true 
  });

  await nextTick();
  ast.transform(comp);

  await nextTick();
  return ast.print_to_string();
}
