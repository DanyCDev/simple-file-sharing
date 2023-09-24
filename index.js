const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.engine('html', require('ejs').renderFile);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));



const logcov = "55"  //replace with random numbers and letters
const dom = "https://fup.kmaster.ovh"   //domain or IP, include https or http
const auth = "true"    //select false for no authentication
const lognam = "admin"    //login name
const logpass = "admin"   //login password
const defpath = "false"   //USE DEFAULT PATH FOR STORING FILES (projectfolder/files/)
const fifoli = "/mnt/filesh/"  //folder where uploaded files are stored - defpath must be false - MUST START AND END WITH / 

if(defpath === "true") {
  var fifol = __dirname + '/files/'
} else {
  var fifol = fifoli
}


function randomgenerator(length) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomIndex];
  }

  return result;
}

// ------------- UPLOAD ------------- \\


var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const random = randomgenerator(10);
    const frandom = fifol + random
    fs.mkdir(frandom, (err) => { });


    callback(null, fifol + random);




  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('thefile');

app.get('/', function(req, res) {


  if(auth === "false") {

    res.cookie('login', logcov); 
    res.redirect('/lon')


  } else {


  const logco1 = req.cookies.login

  if (logco1 === logcov) {
    res.redirect('/lon')
  } else {

  res.sendFile(__dirname + "/fend/login.html"); 
  }

}
});

app.post('/lgc', (req, res) => {

 const name = req.body.name;
 const pass = req.body.pass;


  if(name === lognam) {
    if(pass === logpass) {

      res.cookie('login', logcov); 
      res.redirect('/lon')


    } else {
      res.end("wrong info");
    }
  } else {
    res.end("wrong info");
  }

});

app.get('/lon', function(req, res) {

  const logco = req.cookies.login

  if (logco === logcov) {

  res.cookie('session', '0'); 
  res.sendFile(__dirname + "/fend/upload.html");
  } else {
    res.redirect("/")
  }
});


app.post('/upload', function(req, res) {
    if (req.cookies.session === "1") {
      res.redirect("/");
    } else {
      
  upload(req, res, function(err) {
    
    if (err) {
      console.log(err)
      return res.end("Error uploading file.");

    }

    const nam = req.file.originalname
    const rand = req.file.destination.split('/').pop();

    res.render(__dirname + "/fend/uploadone.html", { rand: rand, nam: nam, dom: dom });

    //    res.end(`File is uploaded successfully! LINK: https://XX.com/files/${rand}/${req.file.originalname}`);



  });

  res.cookie('session', '1')
    }
});



// --------------------------------------------- \\



//--------------------  FILE GIVER -------- \\




const websiteFolderPath = fifol;

app.use('/files', express.static(websiteFolderPath));
app.get('/files/:filename', (req, res) => {
  const requestedFileName = req.params.filename;
  const filePath = path.join(websiteFolderPath, requestedFileName);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${requestedFileName}"`);

    // Send the file as a response
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// -------------------------------------------- \\


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
