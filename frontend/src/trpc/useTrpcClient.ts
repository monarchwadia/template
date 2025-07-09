import { buildTrpcClient } from "./buildTrpcClient";

const trpcClient = buildTrpcClient();

export const useTrpcClient = () => {
    return trpcClient;
}
