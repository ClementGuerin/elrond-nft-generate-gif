const fastify = require('fastify')()
const Gm = require("gm");
const request = require('request');
const fs = require('fs');
const url = require('url');

const dir = __dirname;

fastify.register(require('fastify-cors'), { 
  origin: (origin, cb) => {
    if(origin === "https://tools.bunnyverse.io"){
      //  Request from localhost will pass
      cb(null, true)
      return
    }
    // Generate an error on other origins, disabling access
    cb(new Error("Not allowed"))
  }
})

fastify.post('/generate-gif', (req, reply) => {
  let result = JSON.parse(req.body);
  
  let folderName = Date.now();
  folderName = folderName.toString();
  
  fs.promises.mkdir(dir + "/cache/" + folderName, { recursive: true })
  
  result.images.forEach(function(image, index){
    request.head(image, async function(err, res, body){
      await request(image).pipe(fs.createWriteStream(dir + '/cache/' + folderName + "/" + index + '.jpg')).on('close', function(e){
          console.log(index);
        if(index === (result.images.length - 1)) {

            var createGif = Gm();

            for(var i = 0; i < result.images.length; i++) {
                console.log("t" + i);
                createGif.in(dir + '/cache/' + folderName + "/" + i + '.jpg')

                if(i === (result.images.length - 1)) {
                    console.log("banane");

                    fs.promises.mkdir(dir + "/output/" + folderName, { recursive: true })

                    createGif
                    .delay(result.delay)
                    .resize(512,512)
                    .write(dir + '/output/' + folderName + '/animated.gif', function(err){
                    if (err) throw err;
                    console.log("animated.gif created");

                    reply.send('/output/' + folderName + '/animated.gif');

                    // Delete GIF after 1 hour
                    setTimeout(function(){
                        fs.rmSync(dir + '/cache/' + folderName, { recursive: true, force: true });
                        fs.rmSync(dir + '/output/' + folderName, { recursive: true, force: true });
                        console.log("DELETE FOLDER: " + folderName);
                    },3600000);
                    });
                }
            }
        }
      });
    });
  });
})

fastify.listen(3000);
console.log("Ready!");