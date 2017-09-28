console.log('convert output to woocommerce import format')

var csv = require('csv');
var fs = require('fs');

var input = fs.readFileSync('output_full.csv', 'utf8')

var columns = {
	"post_title": {"col": "ItemName"},
	// "post_name": {"col": "ItemCode"},
	"post_content": {"col": ["U_PropertyTH", "U_PropertyEN"]},
	"sku": {"col": "ItemCode", "function": addUoMSKU},
	"visibility": {"value": "visible"},
	"post_status": {"value": "publish"},
	"stock": {"col": "OnHand"},
	"stock_status": {"col": "OnHand", "function": stockStatus},
	"tax:product_type": {"value": "simple"},
	// "regular_price": {"col": "LastPurPrc"},
	"regular_price": {"col": "X_ItemPrice"},
	"imagesx": {"col": "Attachment", "function": convertImage},
	"meta: Product Brand": {"col": "X_ItemBrand", "function": fixBrand},
	"tax:product_cat": {"col": "X_ItemType", "function": fixItemType}
}

var uomCol;

csv.parse(input, (err, data) => {
	if(err){
		console.log("Error parsing csv", err)
	}

	else{
		var output = []
		var count = data.length - 1
		console.log(count + " records found")

		uomCol = data[0].indexOf('X_UoM')
		var skuCol = data[0].indexOf('ItemCode')
		var titleCol = data[0].indexOf('ItemName')


		//preprocess
		var skus = data.map((r) => {
			return r[skuCol]
		})

		data = data.map((r, index) => {
			if(index > 0){
				var checkDuplicate = skus.some(function(sku, sku_index){
					return (sku == r[skuCol]) && (sku_index != index)
				})
				// console.log(checkDuplicate)
				if(checkDuplicate == true){
					r[titleCol] += " (" + r[uomCol] + ")"
				}				
			}
			return r
		})


		//start building output csv
		for(c in columns){
			var col = columns[c]
			var temp = []
			temp.push(c)

			if(col['value']){
				for(var i = 0; i < count; i++){
					temp.push(col['value'])					
				}
			}

			else if(col['col'] && typeof col['col'] == "string"){
				var findMatchCol = data[0].indexOf(col['col'])
				if(findMatchCol > -1){
					data.forEach((row, index) => {
						if(index > 0){
							if(col['function']){
								temp.push(col['function'](row[findMatchCol], row))
							}else{
								temp.push(row[findMatchCol])								
							}
						}
					})
				}else{
					temp.push('no data')
				}
			}else if(col['col'] && Array.isArray(col['col'])){
				var t = ""
				data.forEach((row, index) => {
					if(index > 0){
						t = ""
						col['col'].forEach((c, colindex) => {
							var findMatchCol = data[0].indexOf(c)
							if(findMatchCol > -1){
								if(col['function']){
									t += col['function'](row[findMatchCol], row)
								}else{
									t += row[findMatchCol]							
								}
								
								if(colindex+1 < col['col'].length){
									t += "\r\r"									
								}
							}
						})
						temp.push(t)
					}
				})

			}

			output.push(temp)
		}

		output = transposeArray(output)
		var image_col = output[0].indexOf('imagesx')
		var desc_col = output[0].indexOf('post_content')
		// var sku_col = output[0].indexOf('sku')

		//Filter out rows with no images
		output = output.filter((o) => {
			if(o[desc_col].trim()){
				return true
			}else{
				return false
			}
		})

		//Add UoM after SKU
		// for(var i = 0; i < output.length; i++){
		// 	var this_sku = output[i][sku_col]

		// 	if(output[i][sku_col])
		// }

		csv.stringify(output, (err, s) => {
			fs.writeFileSync('output-converted.csv', s)
			console.log('done')
		})
	}
})

// function addUoMTitle(title, row){
// 	return title + ' (' + row[uomCol] + ')';
// }

function addUoMSKU(sku, row){
	return sku + '-' + row[uomCol];
}

function stockStatus(onHandValue){
	if(onHandValue > 0){
		return "instock"
	}else{
		return "outofstock"
	}
}

function convertImage(paths){
	var temp = paths.split(";")
	temp = temp.map((t) => {
		return t.substring(t.indexOf("picture") + 8, t.length)
	})
	return temp.join(" | ")
}

function fixItemType(type){
	return type;
}

function fixBrand(raw_brand){
	return raw_brand.substring(raw_brand.indexOf('-') + 1, raw_brand.length)
}

// https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
function transposeArray(array){
	var newArray = array[0].map(function(col, i){
	    return array.map(function(row){
	        return row[i];
	    });
	});
	return newArray
}

