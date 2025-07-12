import { useEffect, useState } from "react";
import { trpcClient } from "./trpc/trpcClient";

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
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Git Reports</h1>
            <p className="text-lg">{message}</p>
        </div>
    )
}
