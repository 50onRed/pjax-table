// install node dependencies, most notably, gulp and gulp plugins
npm install

// install client dependencies
bower install

// (default task) cleans and then builds standalone and distributable versions
gulp

// run unit tests against build versions in phantomJS with singleRun=true 
// Pro Tip: don’t forget the Nyan Reporter
karma start ./path/to/karma.conf.js

// (patch/minor/major) bump package.json and bower.json versions
gulp bump-{type}

// commit the bumped version
git commit -m "bumps version"

// tag the bumped version in git
git tag v0.0.1

// push the bumped version with tags
git push origin master --tags
