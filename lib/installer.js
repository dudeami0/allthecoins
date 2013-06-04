(function () {
    var spawn = require('child_process').spawn,
        exec = require('child_process').exec,
        fs = require('fs');
    
    module.exports = function Installer(coinname) {
        // Test http grab and archive?
        grab_http('/var/www/bittrade/test/', 'https://github.com/bitcoin/bitcoin/archive/master.zip', function () {
            console.log('Done!');
        });
    }
    
    module.exports.prototype = {
        install: function (config, location) {
            if (config.git) {
                this.grab_git()
            }
        },
        grab_http: function (location, address) {
            
        },
        
    };
        
    function grab_init(location, cb) {
        fs.exists(location, function (exists) {
            if (!exists) {
                fs.mkdir(location, function () {
                    cb(exists);
                })
            } else {
                cb(exists);
            }
        });
        // Move into the new location
        process.chdir(location);
    }
    
    function grab_git(location, address, branch) {
        process.chdir(location);
        exec('git', ['init'], function () {
            exec('git', ['remote', 'add', '-t', branch, 'origin', address], function () {
                exec('git', ['fetch'], function () {
                    exec('git', ['checkout', branch], function () {
                        cb();
                    });
                });
            });
        });
    }
    
    function grab_http(location, address, cb) {
        var FetchStream = require("fetch").FetchStream,
            archive = location + address.substr(address.lastIndexOf('/') + 1),
            file = fs.createWriteStream(archive),
            fetch = new FetchStream(address);
        
        console.log('Downloading '+archive);
            
        fetch.on('error', function (err) {
            console.error(err);
        })
        
        fetch.on('meta', function (meta) {
            if (meta.responseHeaders['content-length']) {
                length = meta.responseHeaders['content-length'];
            }
        });
        
        fetch.on('data', function (res) {
            file.write(res);
        });
        
        fetch.on('end', function (res) {
            file.end();
        });
        
        file.on('finish', function () {
            open_archive(archive, location, cb);
        });
    }
    
    function open_archive(archive, location, cb) {
        var formats = ['zip', 'tar.gz', null],
            format, f;
            
        for (f in formats) {
            format = formats[f];
            if (format && archive.substr(archive.length - format.length).lowercase() == format)
                break;
        }
        
        switch (format) {
            case 'zip':
                exec('unzip', [archive, '-d', location], cb);
                break;
            case 'tar.gz':
		exec('tar', ['xvzf', archive, '-C', location], cb);
                break;
            default:
                console.error('No idea what format '+archive+' is!');
                break;
        }
        /**
         * Originally, this was built for the archive plugin. Does not work on linux (or I wasn't able to).
         *
         * Leaving code here for future use with windows.
         * 
        var Archive = require('archive'),
            reader = Archive.Reader({
                path: archive // specify source path
            });
            
        reader.on('directory', function(directory) {
            console.log('Creating '+directory.path);
            fs.mkdir(location + directory.path, function () {
                reader.nextEntry();
            });
        });
          
        reader.on('file', function(file) {
            var stream = fs.createWriteStream(location + file.path);
          
            file.on('error', function(err) {
                console.error(err);
            });
          
            file.on('data', function(buffer) {
                stream.write(buffer);
                reader.nextChunk();
            });
          
            file.on('end', function() {
                stream.end();
                reader.nextEntry();
            });
          
            reader.nextChunk();
        });
          
        reader.on('error', function(err) {
            console.error(err);
        });
          
        reader.on('end', function() {
            cb();
        });
          
        reader.open(function(info) {
            reader.nextEntry();
        });
        */
    }
})();