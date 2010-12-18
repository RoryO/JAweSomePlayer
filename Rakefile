task :default => [:concat, :minify] do

end

task :concat => :clean do
  Dir.chdir('js')
  File.open("player.js", "w+") do |f|
    FileList['es5-shim.js', 'utils.js', 'slider.js', 'base.js'].each do |source_file|
      f << File.read(source_file)
    end
  end
  Dir.chdir('..')
end

task :minify do
  rm_rf 'js/player-min.js'
  file 'js/player-min.js'
  system "java -jar lib/yuicompressor.jar js/player.js > js/player-min.js"
end

task :clean do
  rm_rf 'js/player.js'
  rm_rf 'js/player-min.js'
end
