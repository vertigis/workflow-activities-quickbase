import QuickbaseService from "./QuickbaseService";
import { QuickbaseRequestError } from "./QuickbaseError";

async function getAuthHeaders(quickbaseService: QuickbaseService, id: string): Promise<Record<string, string>> {
    const token = await quickbaseService.getToken(id)
    return {
        Authorization: `${token}`,
        "qb-realm-hostname": quickbaseService.hostName,

    };
}

export function get<T = any>(
    service: QuickbaseService,
    id: string,
    path: string,
    query?: Record<string, string | number | number[] | boolean | Record<string, string | number> | Record<string, string | number>[] | null | undefined>,
    headers?: Record<string, any>,
    expectedResponse?: "blob" | "json",
): Promise<T> {
    return httpRequest(
        service,
        id,
        "GET",
        path,
        query,
        undefined,
        headers,
        expectedResponse,
    );
}

export function post<T = any>(
    service: QuickbaseService,
    id: string,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>,
): Promise<T> {
    const postHeaders = {
        ...headers,
        ["Content-Type"]: "application/json"
    };
    return httpRequest(service, id, "POST", path, undefined, body, postHeaders);
}

export function patch<T = any>(
    service: QuickbaseService,
    id: string,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>,
): Promise<T> {
    const patchHeaders = {
        ...headers,
        ["Content-Type"]: "application/json"
    };
    return httpRequest(service, id, "PATCH", path, undefined, body, patchHeaders);
}

export function httpDelete<T = any>(
    service: QuickbaseService,
    id: string,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>,
): Promise<T> {
    return httpRequest(service, id, "DELETE", path, undefined, body, headers);
}

async function httpRequest<T = any>(
    service: QuickbaseService,
    id: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    query?: Record<string, string | number | number[] | boolean | Record<string, string | number> | Record<string, string | number>[] | null | undefined>,
    body?: Record<string, any>,
    headers?: Record<string, any>,
    expectedResponse?: "blob" | "json"
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!id) {
        throw new Error("Quickbase entity id required");
    }

    const url = new URL(`${service.instanceUrl}${path}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.append(key, value?.toString() || "");
        }
    }
    const authHeaders = await getAuthHeaders(service, id);

    const response = await fetch(url, {
        method,
        headers: {
            Accept: expectedResponse === "blob" ? "*/*" : "application/json",
            ...authHeaders,
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const error = await getResponseError(response);
    if (error) {
        throw error;
    }

    if (response && response.status === 204) {
        // No content
        return {} as T;
    } else {
        return await response.json();
    }
}


export async function getResponseError(response: Response) {
    if (!response.ok) {
        // Try to read the error body of the response
        let errors: Record<string, any>[] | undefined;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            try {
                const responseJson = await response.json();
                errors = responseJson?.errors || responseJson;
            } catch {
                // Swallow errors reading the response so that we don't mask the original failure
            }
        }
        return new QuickbaseRequestError(response.status, errors);
    }
}


