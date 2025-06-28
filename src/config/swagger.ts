import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "BULDM API",
			version: "1.0.0",
			description: "Lost and Found App API with Image Prediction",
		},
		servers: [
			{
				url: "http://localhost:3000",
			},
		],
	},
	apis: ["./src/routes/**/*.ts"], // ← هنا بتحط مسار ملفات الراوتر اللي فيها التعليقات
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
