task :default => [:concat, :minify] do

end

task :concat => :clean_js do
  Dir.chdir('js')
  File.open("player.js", "w+") do |f|
    FileList['swfobject.js', 'es5-shim.js', 'utils.js', 'slider.js', 
      'broker.js', 'engine.js', 'base.js'].each do |source_file|
      f << File.read(source_file)
    end
  end
  Dir.chdir('..')
end

task :minify do
  file 'js/player-min.js'
  system "java -jar lib/yuicompressor.jar js/player.js > js/player-min.js"
end

task :clean_flash do
  rm_rf 'flash/*.swf'
end

task :clean_js do
  rm_rf 'js/player.js'
  rm_rf 'js/player-min.js'
end

task :flash do
  Dir.chdir 'flash'
  system 'mxmlc -load-config+=base.xml -load-config+=release.xml JAwesomePlayer.as -o jsplayer.swf'
  Dir.chdir '..'
end

task :flash_debug do
  Dir.chdir 'flash'
  system 'mxmlc  -load-config+=base.xml -load-config+=debug.xml JAwesomePlayer.as -o jsplayer_debug.swf'
  Dir.chdir '..'
end

task :everything => [:concat, :clean_flash, :minify, :flash_debug, :flash]
