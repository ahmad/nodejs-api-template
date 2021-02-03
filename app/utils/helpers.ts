import crypto from "crypto"

export const generateRandomToken = async (size: number = 20) => {
	return new Promise((resolve: any, rejects: any) => {
		crypto.randomBytes(size, (err: any, buffer: Buffer) => {
			if (err) return rejects("Unable to random token");
			return resolve(buffer.toString("hex"));
		});
	})
}