namespace :build do

  BACKBONE         = '../backbone/backbone.js'
  UNDERSCORE       = '../underscore/underscore.js'
  VISUALSEARCH_JS  = '../visualsearch/build/visualsearch.js'
  VISUALSEARCH_CSS = '../visualsearch/build/visualsearch.css'

  # Figure out the version number of a JS source file.
  def get_version(string)
    string.match(/VERSION = '(\S+)'/)[1]
  end

  # Pull in a new build of Backbone.
  task :backbone do
    version = get_version File.read BACKBONE
    FileUtils.cp BACKBONE, "public/javascripts/vendor/backbone-#{version}.js", :verbose => true
  end

  # Pull in a new build of Underscore.
  task :underscore do
    version = get_version File.read UNDERSCORE
    FileUtils.cp UNDERSCORE, "public/javascripts/vendor/underscore-#{version}.js", :verbose => true
  end

  # Pull in a new build of VisualSearch.
  task :visualsearch do
    version = get_version File.read VISUALSEARCH_JS
    FileUtils.cp VISUALSEARCH_JS, "public/javascripts/vendor/visualsearch-#{version}.js", :verbose => true
    FileUtils.cp VISUALSEARCH_CSS, "public/stylesheets/vendor/", :verbose => true

    # Fix image url paths.
    File.open('public/stylesheets/vendor/visualsearch.css', 'r+') do |file|
      css = file.read
      css.gsub!(/url\((.*?)images\/embed\/icons/, 'url(../../images/embed/icons')
      file.rewind
      file.write(css)
      file.truncate(css.length)
    end
  end

  # Pull in a new build of the Document Viewer.
  task :viewer, :compile_wpd do |t, args|

    if args[:compile_wpd] != 'false' then
      #Compile WPD
      Dir.chdir '../WebPlotDigitizer'
      sh "bash build.sh"
    end

    #Pull WPD into DV
    Dir.chdir '../document-viewer'
    sh "sh pull_wpd.sh"

    FileUtils.rm_r('build') if File.exists?('build')
    sh "jammit -f -o build"
    sh "rm build/*.gz"
    Dir['build/*.css'].each do |css_file|
      File.open(css_file, 'r+') do |file|
        css = file.read
        css.gsub!(/(\.\.\/)+images/, 'images')
        file.rewind
        file.write(css)
        file.truncate(css.length)
      end
    end
    FileUtils.cp_r('public/images', 'build/images')

    # Export back to DocumentCloud
    FileUtils.cp_r "public/javascripts/WPD", "../documentcloud/public/viewer"
    FileUtils.cp_r('build/images', '../documentcloud/public/viewer')
    `cat build/viewer.js build/templates.js > build/viewer_new.js`
    FileUtils.rm_r(['build/viewer.js', 'build/templates.js'])
    FileUtils.mv 'build/viewer_new.js', 'build/viewer.js'
    FileUtils.cp 'build/print.css', "../documentcloud/public/viewer/printviewer.css"
    Dir['build/viewer*'].each do |asset|
      FileUtils.cp(asset, "../documentcloud/public/viewer/#{File.basename(asset)}")
    end
    FileUtils.rm_r('build') if File.exists?('build')

  end

  task :graph do
    Dir.chdir '../WebPlotDigitizer'

    FileUtils.rm_r('combined.js') if File.exists?('combined.js')
    FileUtils.rm_r('combined-compiled.js') if File.exists?('combined-compiled.js')
    sh "bash build.sh"
    FileUtils.cp('combined-compiled.js', '../documentcloud/public/graph/combined-compiled.js')
    FileUtils.cp('index.html', '../documentcloud/public/graph/index.html')
  end

  [:search_embed, :note_embed].each do |embed|
    task embed do
      FileUtils.rm_r('build') if File.exists?('build')
      sh "jammit -f -o build -c config/#{embed}_assets.yml"
      sh "rm build/*.gz"

      Dir['build/*.css'].each do |css_file|
        File.open(css_file, 'r+') do |file|
          css = file.read
          css.gsub!("/images/#{embed}", 'images')
          file.rewind
          file.write(css)
          file.truncate(css.length)
        end
      end
      FileUtils.cp_r("public/images/#{embed}", 'build/images') if File.exists?("public/images/#{embed}")

      FileUtils.rm_r("public/#{embed}") if File.exists?("public/#{embed}")
      FileUtils.cp_r('build', "public/#{embed}")

      FileUtils.rm_r('build') if File.exists?('build')
    end
  end

end
