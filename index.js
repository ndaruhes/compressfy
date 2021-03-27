const express = require("express");
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const imagemin = require("imagemin");
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require("imagemin-pngquant");
const imageminGiflossy = require('imagemin-giflossy');
const imageminSvgo = require('imagemin-svgo');
const {extendDefaultPlugins} = require('svgo');
//const imageminWebp = require('imagemin-webp');

const app = express();
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

app.set("view engine", "ejs");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", upload.single("image"), (req, res, next) => {
  const file = req.file;
  var ext;

  if (!file) {
    const error = new Error("Please Upload a file");
    error.httpStatusCode = 404;
    return next(error);
  }
  if (file.mimetype == "image/jpeg") {
    ext = "jpg";
  }
  if (file.mimetype == "image/png") {
    ext = "png";
   }
	//if (file.mimetype == "image/webp") {
	//	ext = "webp";
	//}
	
	if (file.mimetype == "image/svg+xml") {
		ext = "svg";
	}
	if (file.mimetype == "image/gif") {
		ext = "gif";
	}

  res.render("image", { url: file.path, name: file.filename, ext: ext });
});

app.post("/compress/uploads/:name/:ext", async (req, res) => {
  const files = await imagemin(["uploads/" + req.params.name], {
    destination: "output",
    plugins: [
		imageminMozjpeg({quality: [20]}),
		imageminPngquant({quality: [0.6, 0.8]}),
		imageminGiflossy({ lossy: 80 }),
		imageminSvgo({
			plugins: extendDefaultPlugins([
				{name: 'removeViewBox', active: false}
			])
		}),
		//imageminWebp({quality: 50})
    ]
  });
    res.download(files[0].destinationPath);
});

app.listen(5000, function() {
  console.log("Server is listening on port 5000");
});
