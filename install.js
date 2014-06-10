var os = require("os");
var fs = require("fs");
var path = require("path");

var source = path.join(__dirname, "prebuild", os.platform(), os.arch(), "oracle_bindings.node");
var targetDir = path.join(__dirname, "build", "Release");
var target = path.join(targetDir, "oracle_bindings.node");

console.log("install.js settings:");
console.log("\t", source);
console.log("\t", targetDir);
console.log("\t", target);


if (!fs.existsSync(source)) {

	console.log("Does not exist");
	return process.exit(1); 
};


var mkdir = function (p, root) {

    var dirs = p.split(path.sep), dir = dirs.shift(), root = (root||'')+dir+path.sep;

    try { fs.mkdirSync(root); }
    catch (e) {
         //dir was not made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error("couldn't ensure target path " + targetDir, e);
    }

    return !dirs.length||mkdir(dirs.join(path.sep), root);
};

mkdir(targetDir);

var writer = fs.createWriteStream(target);
writer.on("end", function () {
	console.log("oracle_bind was copied from " + source);
	pocess.exit(0);
});
writer.on("error", function(err) {
	console.log("Can not copy oracle_bind from " + source + " to " + target);
	throw err;
});
fs.createReadStream(source).pipe(writer);	

