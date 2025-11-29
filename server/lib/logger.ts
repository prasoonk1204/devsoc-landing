import winston from "winston";
import { env } from "./env";

const isDevelopment = env.NODE_ENV === "development";

// Custom format for development - colorized and readable
const devFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
		return `[${timestamp}] ${level}: ${message}${metaStr}`;
	}),
);

// Custom format for production - JSON for log aggregation services
const prodFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json(),
);

// Create Winston logger
const winstonLogger = winston.createLogger({
	// In development: show all logs (debug and above)
	// In production: only show warnings and errors
	level: isDevelopment ? "debug" : "warn",
	format: isDevelopment ? devFormat : prodFormat,
	transports: [
		new winston.transports.Console({
			stderrLevels: ["error"],
		}),
	],
	// Silence the logger completely if not in development or production
	silent: false,
});

class Logger {
	info(message: string, meta?: any): void {
		winstonLogger.info(message, meta);
	}

	warn(message: string, meta?: any): void {
		winstonLogger.warn(message, meta);
	}

	error(message: string, error?: any): void {
		if (error instanceof Error) {
			winstonLogger.error(message, {
				error: error.message,
				stack: isDevelopment ? error.stack : undefined,
				code: (error as any).code,
			});
		} else if (error) {
			winstonLogger.error(message, { error });
		} else {
			winstonLogger.error(message);
		}
	}

	debug(message: string, meta?: any): void {
		winstonLogger.debug(message, meta);
	}

	request(
		method: string,
		path: string,
		statusCode: number,
		duration: number,
	): void {
		const message = `${method} ${path} ${statusCode} - ${duration}ms`;
		const meta = { method, path, statusCode, duration };

		if (statusCode >= 500) {
			winstonLogger.error(message, meta);
		} else if (statusCode >= 400) {
			winstonLogger.warn(message, meta);
		} else {
			winstonLogger.info(message, meta);
		}
	}
}

export const logger = new Logger();
