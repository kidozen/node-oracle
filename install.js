var os = require("os");
var fs = require("fs");
var path = require("path");

var nodeVersion;

if (process.version.indexOf("v0.10") === 0) {
    nodeVersion = "node0.10";
} else if (process.version.indexOf("v0.8") === 0) {
    nodeVersion = "node0.8";
} else {
    console.log("Binary distribution not included. Compiling...");
    return process.exit(1); 
}

var sourceDir = path.join(__dirname, "prebuild", os.platform(), os.arch(), nodeVersion);
var source = path.join(sourceDir, "oracle_bindings.node");

var targetDir = path.join(__dirname, "build", "Release");

console.log("install.js settings:");
console.log("\t", sourceDir);
console.log("\t", targetDir);

if (!fs.existsSync(source)) {

	console.log("oracle_bindings.node for platform " + os.platform() + " and arch " + os.arch() + " does not exist");
	return process.exit(1); 
}


var mkdir = function (p, root) {
    "use strict";
    var dirs = p.split(path.sep), dir = dirs.shift(), root = (root||'')+dir+path.sep;

    try { fs.mkdirSync(root); }
    catch (e) {
         //dir was not made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error("couldn't ensure target path " + targetDir, e);
    }
    return !dirs.length||mkdir(dirs.join(path.sep), root);
};


var cp = function(src, dest, cb) {
    "use strict";
    var count = 0;

    var copyFile = function(src, dest, cb) {
        var writer = fs.createWriteStream(dest);
        writer.on("end", function () {
            console.log(src + " was copied to " + dest);
            cb();
        });
        writer.on("error", function(err) {
            console.log("Can not copy " + src + " to " + dest);
            cb(err);
        });
        fs.createReadStream(src).pipe(writer);   
    };

    var copyRecursive = function(src, dest, cb) {
        console.log ("copy", src, dest);
        var exists = fs.existsSync(src);
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();

        if (isDirectory) {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function(childItemName) {
                count++;
                copyRecursive(path.join(src, childItemName),
                    path.join(dest, childItemName), function(err) {
                        cont--;
                    }
                );
            });
            if (count===0) cb();
        } else {
            count++;
            copyFile(src, dest, function(err) {
                count--;
                if (count===0 || err) cb(err);
            });
        }
    };

    copyRecursive(src, dest, cb);
};

mkdir(targetDir);
cp(sourceDir, targetDir, function (err){
    "use strict";
    process.exit(err ? 1 : 0);
});

