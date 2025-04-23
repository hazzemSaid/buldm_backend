export interface ICustomError {
	message: string;
	statuscode: number;
	data: any;
}

class ErrorHandler {
	static createError(message: string | undefined, statuscode: number, data?: any): ICustomError {
		return {
			message: message || "something went wrong",
			statuscode: statuscode || 500,
			data: data || "no data",
		};
	}
}

export default ErrorHandler;