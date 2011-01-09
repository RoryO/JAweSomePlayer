task :default => [:concat, :minify] do

end

task :concat => :clean do
  Dir.chdir('js')
  File.open("player.js", "w+") do |f|
    FileList['es5-shim.js', 'utils.js', 'slider.js', 'engine.js', 'base.js'].each do |source_file|
      f << File.read(source_file)
    end
  end
  Dir.chdir('..')
end

task :minify do
  file 'js/player-min.js'
  system "java -jar lib/yuicompressor.jar js/player.js > js/player-min.js"
end

task :clean do
  rm_rf 'js/player.js'
  rm_rf 'js/player-min.js'
  rm_rf 'flash/JAwesomePlayer.swf'
end

task :flash do
  Dir.chdir 'flash'
  system 'mxmlc -load-config base.xml release.xml'
  Dir.chdir '..'
end

task :flash_debug do
  Dir.chdir 'flash'
  system 'mxmlc -load-config base.xml debug.xml'
  Dir.chdir '..'
end
