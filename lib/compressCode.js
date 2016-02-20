import UglifyJS from 'uglify-js';
export default function compressCode(code){
  const ast = UglifyJS.parse(code);
  ast.figure_out_scope();
  ast.compute_char_frequency();
  ast.mangle_names();
  const comp = UglifyJS.Compressor({
    drop_console: true 
  });
  ast.transform(comp);
  return ast.print_to_string();
}
