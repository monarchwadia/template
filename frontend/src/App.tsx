import { useEffect, useState } from "react";
import { trpcClient } from "./clients/trpcClient";

export default function App(){
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        trpcClient.health.query()
            .then((response) => {
                setMessage(response.status);
            })
            .catch((error) => {
                console.error("Error fetching health status:", error);
            });
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Coolproject</h1>
            <p className="text-lg">{message}</p>
        </div>
    )
}
