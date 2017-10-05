  var Client = require('ftp');
  var fs = require('fs');
  var ftp_config = require('./config.js').ftp
  var input = fs.readFileSync(__dirname + '/../outputs/image-names.txt', 'utf8').split("\n")

  var dir_list;
  console.log(input)
  var c = new Client();

  c.on('ready', function() {
    c.list(function(err, list) {
      if (err) throw err;
      // console.dir(list);
      dir_list = list.map((r) => {
        return (r.name).toLowerCase()
      })
      
      console.log(dir_list)

      getImage(input[0], 0)


    });
  });

  c.connect(ftp_config);

  function getImage(image, count){
      console.log(image, count)
      if(dir_list.indexOf(image.toLowerCase()) > -1){
        c.get(image, function(err, stream){

          if(err){
            throw err;          
          }

          else{
            stream.pipe(fs.createWriteStream(__dirname + "/../outputs/images/" + image))
            count++;

            if(count < input.length){
              stream.once('close', function() {
                getImage(input[count], count)          
              });
            }
            else{
              stream.once('close', function() {
                console.log('ending connection.')
                c.end();
              });
            }

          }
        })        
      }

      else{
        count++;
        if(count < input.length){
          getImage(input[count], count)          
        }else{
          console.log('ending connection.')
          c.end();
        }
      }

  }