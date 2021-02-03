

export class AppError extends Error {
	message: string  	= ""
	stack: any 			= null

	constructor(message: string, stack: any){
		super();

		this.message = message;
		this.stack 	 = stack;
	}
} 