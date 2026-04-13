import multer from "multer";

//Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export { upload, storage };
