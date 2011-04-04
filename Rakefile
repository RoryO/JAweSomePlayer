VERSION = "0.1"

task :default => [:concat, :minify]

task :concat => :clean_js do
  File.open("js/player.js", "w+") do |f|
    Dir.chdir 'lib/js' do
      puts Dir.pwd
      f << File.read('./swfobject.js')
    end
    Dir.chdir 'src' do
      FileList['es5-shim.js', 'utils.js', 
        'broker.js', 'engine.js', 'base.js'].each do |source_file|
        f << File.read(source_file)
      end
    end
  end
end

task :minify do
  file 'js/player-min.js'
  system "java -jar lib/yuicompressor.jar js/player.js > js/player-min.js"
end

task :clean => [:clean_js, :clean_flash, :clean_doc]

task :clean_flash do
  rm_rf 'flash/*.swf'
end

task :clean_js do
  rm_rf 'js/*'
end

task :clean_doc do
  rm_rf "lib/yuidoc/out/*"
  rm_rf "doc/*"
end

task :flash do
  Dir.chdir 'flash' do
    system 'mxmlc -load-config+=base.xml -load-config+=release.xml JAwesomePlayer.as -o jsplayer.swf'
  end
end

task :flash_debug do
  Dir.chdir 'flash' do
    system 'mxmlc  -load-config+=base.xml -load-config+=debug.xml JAwesomePlayer.as -o jsplayer_debug.swf'
  end
end

task :doc do
  doc_home = "./lib/yuidoc"
  template_files = "./lib/yuidoc/template"
  parser_in = "./src"
  parser_out = "./lib/yuidoc/out"
  generator_out = "./doc"
  system "python lib/yuidoc/yuidoc.py #{parser_in} -p #{parser_out} -o #{generator_out} -t #{template_files} -v #{VERSION}"
end

task :everything => [:concat, :clean_flash, :minify, :flash_debug, :flash]
