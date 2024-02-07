import { randomUUID } from "crypto";
import { diskStorage } from "multer";


const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png'
};

export enum STATUS {
	CONNECTED = 'Connected',
	DISCONNECTED = 'Disconnected',
	IN_GAME = 'In Game',
	IN_POOL = 'In Pool',
}

export const storageForAvatar = {
	storage: diskStorage({
		destination: './uploads/avatars',
		filename: (req, file, cb) => {
				const filename : string = file.originalname.split(' ').join('_') +  randomUUID();
				console.log("RES : " )
				const extension : string = MIME_TYPES[file.mimetype];
				cb(null, `${filename}${extension}`);
			}
		}),
		fileFilter: (req, file, cb) => {
			if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
				cb(null, true);
			}
			else {
				cb(null, false);
			}
		}
}
