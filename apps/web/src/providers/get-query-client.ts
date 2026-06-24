import { isServer, QueryClient } from "@tanstack/react-query";

function makeClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                networkMode: 'offlineFirst',
                refetchOnReconnect: true
            },
        }
    })
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
    if (isServer) {
        return makeClient();
    } else {
        if (!browserQueryClient) browserQueryClient = makeClient();
        return browserQueryClient;
    }
}
