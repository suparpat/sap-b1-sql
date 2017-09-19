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
            .query("select COLUMN_NAME from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='OITM'")

        cols = cols.recordset

        cols = cols.map((r) => {
        	return r.COLUMN_NAME
        })

        let result = await pool.request()
            .query(`select TOP 10 * from OITM`)

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
	temp.unshift(cols)

	csv.stringify(temp, (err, s) => {
		fs.writeFileSync('output.csv', s)
		console.log('done')
	})

})
