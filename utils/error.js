class Error_handler  {
	createError(message, statuscode) {
		const error = new Error(message);
		error.statuscode = statuscode || 500;
		return error;
	}
}

module.exports = new Error_handler();