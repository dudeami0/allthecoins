/**
 * Setup our environment.
 *
 * Note this is for Ubuntu only!
 */
(function () {
    var spawn = require('child_process').spawn,
        exec = require('child_process').exec,
        readline = require('readline'),
        prompt = require('prompt'),
        packages = [
            'python-software-properties',
            'git',
            'php5-curl',
            'build-essential',
            'libssl-dev',
            'libboost1.48-all-dev',
            'libdb4.8-dev',
            'libdb4.8++-dev',
            'libminiupnpc-dev',
            'libqrencode-dev',
            'unzip',
            'libcurl4-openssl-dev',
            'libglib2.0-dev',
            'libglibmm-2.4-dev',
            'libwxgtk2.8-dev',
            'libwxgtk2.8-dbg',
            'libgtk2.0-dev'
        ];
    
    module.exports = function Setup() {
        // First off, we check the packages
        check_packages(function (needed) {
            if (needed.length > 0) {
                if (needed.indexOf('python-software-properties')) {
                    setup_repos(function (installed) {
                        setup_install(installed);
                    });
                } else {
                    setup_install(true);
                }
            } else {
                console.log('Dependencies check out!');
            }
        });
    }
    
    function question(text, cb) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(text+' ', function(answer) {
            rl.close();
            cb(answer);
        });
    }
    
    function setup_install() {
        console.log('Missing depenencies:\n    '+needed.join(' '));
        question('Installed now? (Y/n)', function (answer) {
            if (!answer || answer.substr(0, 1).lowercase() == 'y') {
                args = ['apt-get', 'install'].concat(needed);
                exec('sudo', args, function () {
                    console.log('All done!');
                });
            } else {
                console.write('Command you need to run:\n    sudo apt-get install '+needed.join(' '));
            }
        });
    }
    
    function setup_repos(cb) {
        console.log('Your missing python-software-properties, we need this to add the repo!');
        question('Install python-software-properties and install bitcoin PPA?', function (install) {
            if (install) {
                exec('sudo', ['install', 'python-software-properties'], function () {
                    exec('sudo', ['apt-add-repository', '-y', 'http://ppa.launchpad.net/bitcoin/bitcoin/ubuntu'], function () {
                        exec('sudo', ['apt-get', 'update'], function () {
                            cb(true);
                        });
                    });
                });
            } else {
                cb(false);
            }
        });
    }
    
    /**
     * Runs a check through the system to ensure we have all
     * the dependencies.
     */
    function check_package(name, cb) {
        console.log('Checking '+name);
        var dpkg = spawn('dpkg', ['-s', name]),
            data = '';
        
        dpkg.stdout.on('data', function (d) {
            data += d.toString();
        })
        
        dpkg.stdout.on('end', function () {
            // Data has been parsed, check the status
            cb(data.indexOf('package \''+name+'\' is not installed') === -1);
        });
    }
    
    function check_packages(cb) {
        var checks = 0,
            needed = [],
            i;
        
        for (i in packages) {
            (function (i) {
                var p = packages[i];
                check_package(p, function (installed) {
                    checks++;
                    
                    if (!installed) {
                        needed.push(p);
                    }
                    
                    if (checks == packages.length) {
                        cb(needed);
                    }
                });
            })(i);
        }
    }
    
    
})();