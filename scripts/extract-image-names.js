console.log('extract image names')

var csv = require('csv');
var fs = require('fs');

var input = fs.readFileSync(__dirname + '/../outputs/output-products.csv', 'utf8')

csv.parse(input, (err, data) => {
	if(err){
		console.log("Error parsing csv", err)
	}

	else{
		var output = []
		var count = data.length - 1
		console.log(count + " records found")

		imagePathCol = data[0].indexOf('Attachment')

		data.forEach((r, index) => {
			if(index > 0){
				if(r[imagePathCol]){
					var temp = r[imagePathCol].split(";")

					temp = temp.map((o) => {
						return o.substring(o.indexOf('picture') + 8, o.length)
					})

					output = output.concat(temp)				
				}
			}
		})
		console.log(output)
			fs.writeFileSync(__dirname + '/../outputs/image-names.txt', output.join("\n"))

	}
})

