// NodeJS Framework
const fastify = require('fastify')()

// GIF Generation
const request = require('request');
const fs = require('fs');
const Gm = require("gm");

// WebSocket Server
//fastify.register(require('fastify-socket.io'))

// Get current directory
const dir = __dirname;

fastify.register(require('fastify-cors'), { 
  // origin: (origin, cb) => {
  //   if(origin === "https://tools.bunnyverse.io"){
  //     //  Request from localhost will pass
  //     cb(null, true)
  //     return
  //   }
  //   // Generate an error on other origins, disabling access
  //   cb(new Error("Not allowed"))
  // }
})

fastify.post('/generate-gif', (req, reply) => {
  // Get POST parameters
  let result = JSON.parse(req.body);
  
  // Generate Cache Temp Name Directory
  let folderName = create_UUID();

  // Create Cache Temp directory
  fs.mkdir(dir + "/cache/" + folderName, function (err) {
      if (!err) {
        console.log("Cache Directory '" + folderName + "' Created!");

        // Download each images
        let imagesDownloaded = 0;
        result.images.forEach(function(image, index) {
          // Download Image
          request.head(image, function(err, res, body){
            request(image).pipe(fs.createWriteStream(dir + '/cache/' + folderName + "/" + index + '.jpg')).on('close', function(err) {
              if(!err) {
                console.log("Image downloaded: " + index + "/" + result.images.length);
                imagesDownloaded++;
      
                if(imagesDownloaded === result.images.length) {
                  generateGif(folderName, result);
                }
              } else {
                console.error(err);
              }
            });
          });
        });
      } else {
        console.error(err);
      }
  });

  function generateGif(folderName, result) {
    // Create Output Temp Directory
    fs.mkdir(dir + "/output/" + folderName, function (err) {
      if(!err) {
        // Save GM Function for build it
        let GraphicsMagickGIFFunc = new Gm();

        for(let i = 0; i < result.images.length; i++) {
          // Concatenete GM Function with downloaded images
          GraphicsMagickGIFFunc.in(dir + '/cache/' + folderName + "/" + i + '.jpg')
          console.log("GM Function: Add Layer " + i);
        }

        // Generate GIF with GM
        GraphicsMagickGIFFunc
          .delay(result.delay)
          .resize(512,512)
          .write(dir + '/output/' + folderName + '/output.gif', function(err){
          if(!err) {
            console.log("GIF Generated");

            // Reply POST Request with relative path to the GIF file
            reply.send('/output/' + folderName + '/output.gif');
          } else {
            console.error(err);
          }
        });
      } else {
        console.error(err);
      }
    });
  }

  function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }
})

// fastify.ready(err => {
//   if (err) throw err

//   fastify.io.on('connect', (socket) => console.info('Socket connected!', socket.id))
// })

fastify.listen(3000);
console.log("Ready!");