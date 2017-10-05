console.log('query price')

var csv = require('csv');
var fs = require('fs');
const express = require('express')
const app = express()


var input = fs.readFileSync(__dirname + '/../outputs/output-pricelists.csv', 'utf8')

//Input: customer, sku(s), cookie
//Output: price for this customer of requested products

csv.parse(input, (err, data) => {
	if(err){
		console.log("Error parsing csv", err)
	}

	else{
		console.log(data.length - 1 + " records found")

		var skuCol = data[0].indexOf('U_ItemCode')
		var customerCol = data[0].indexOf('X_Name')
		var priceCol = data[0].indexOf('U_UnitPrice')
		var uomCol = data[0].indexOf('U_UoM')

		data.forEach((r) => {
			r[skuCol] += "-" + r[uomCol]
		})

		app.listen(3000, () => {
		  console.log('Example app listening on port 3000!')
		})

		// Example
		// http://localhost:3000/?cuscode=ABC&skus=1234,1235
		
		app.get('/', (req, res) => {

			//TODO: 
			// - map customer email with customer code
			// - logging/monitoring to see usage
			// - restrict requests to only from wordpress server

			var cuscode = req.query.cuscode
			var skus = (req.query.skus).split(",")

			var f = data.filter((r) => {
				return r[customerCol] == cuscode
			})

			var p = f.filter((r) => {
				return skus.indexOf(r[skuCol]) > -1
			})

			var output = p.map((r) => {
				return {
					"sku": r[skuCol],
					"price": r[priceCol],
					// "uom": r[uomCol]
				}
			})

			res.send(output)
		})

	}
})

