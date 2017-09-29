const sql = require('mssql')
var csv = require('csv');
var cols
var fs = require('fs')
var config = require('./config.js')
var config_string = 'mssql://' + config['username'] + ":" + config["password"] + "@" + config["host"] + "/" + config["database"]

async function start() {

    try{
    	console.log("Connecting to " + config['host'])
        const pool = await sql.connect(config_string)

        cols = await pool.request()
            .query("select COLUMN_NAME from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='@PRICELIST_DETAIL'")

        cols = cols.recordset

        cols = cols.map((r) => {
        	return r.COLUMN_NAME
        })

        let result = await pool.request()
            .query(`select T0.*,T1.[Name] 
            	from [dbo].[@PRICELIST_DETAIL] T0 
            	inner join [dbo].[@PRICELIST_LIST] T1 on T0.[Code]=T1.[Code]`)


        pool.close()
        return result
    }

    catch (err){
    	console.log(err)
        pool.close()
    }
}



start().then((r) => {
	console.log('parsing')
	
	var temp = r.recordset
	cols.push('X_Name')

	temp.unshift(cols)
	csv.stringify(temp, (err, s) => {
		fs.writeFileSync(__dirname + '/../outputs/output-pricelists.csv', s)
		console.log('done')
	})

})
