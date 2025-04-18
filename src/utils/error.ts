class CustomError extends Error {
	statuscode: number;
	data: any;

	constructor(message: string | undefined, statuscode: number, data?: any) {
		super(message);
		this.statuscode = statuscode || 500;
		this.message = message || "something went wrong";
		this.data = data || "no data";
	}
}

class Error_handler {

	static createError(message: string | undefined, statuscode: number, data?: any) {
		return new CustomError(message, statuscode, data);
	}
}

export default Error_handler;