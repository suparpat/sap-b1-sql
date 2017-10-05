var config = {
	host: 'abc.com',
	username: 'username',
	password: 'password',
	database: 'mydb',
	pricelist_code: '1234',
	ftp: {
		host: 'myhost.com',
	    port: 21,
	    user: 'user',
	    password: 'password',
	    secure: true,
	    secureOptions: {
	      'rejectUnauthorized': false
	    }
	}
}

module.exports = config