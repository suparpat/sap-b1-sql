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

        var pricelist_code = config['pricelist_code']

        let result = await pool.request()
            .query(`select TOP 100 T0.*,T1.[ItmsGrpNam],T2.[Name],T3.[U_UnitPrice],T3.[U_UoM] 
            	from [dbo].[OITM] T0 
            	inner join [dbo].[OITB] T1 on T0.[ItmsGrpCod]=T1.[ItmsGrpCod] 
            	inner join [dbo].[@ITEMGROUP2] T2 on T0.[U_ItemGroup2]=T2.[Code]
            	inner join [dbo].[@PRICELIST_DETAIL] T3 on T0.[ItemCode]=T3.[U_ItemCode] where T3.[Code]='`+pricelist_code+`'`)

        // let result = await pool.request()
        //     .query(`select TOP 10 T0.*,T1.ItmsGrpNam 
        //     	from dbo.[OITM] T0 
        //     	inner join dbo.[OITB] T1 on T0.ItmsGrpCod=T1.ItmsGrpCod`)

        // let ItmsGrpCod = await pool.request()
        //     .query(`select ItmsGrpCod,ItmsGrpNam from OITB`)


        // console.log(ItmsGrpCod)

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
	cols.push('X_ItemBrand')
	cols.push('X_ItemType')
	cols.push('X_ItemPrice')
    cols.push('X_UoM')

	temp.unshift(cols)
	csv.stringify(temp, (err, s) => {
		fs.writeFileSync('output.csv', s)
		console.log('done')
	})

})
