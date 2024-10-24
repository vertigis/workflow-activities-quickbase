export class QuickbaseRequestError extends Error {
    readonly statusCode: number;
    readonly errors?: Record<string, any>[];
    readonly description?: string;

    constructor(
        statusCode: number,
        errors?: Record<string, any>[],
        message?: string,
        description?: string,
    ) {
        super(message || "Quickbase request failed.");
        this.errors = errors;
        this.statusCode = statusCode;
        this.description = description;
    }
}