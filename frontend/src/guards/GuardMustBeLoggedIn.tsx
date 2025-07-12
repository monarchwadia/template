import { type PropsWithChildren } from "react";
import { useLoggedInState } from "../hooks/useIsLoggedIn"

export const GuardMustBeLoggedIn = (props: PropsWithChildren) => {
    const loggedInState = useLoggedInState();

    if (loggedInState === "loading") {
        return <div>Loading...</div>;
    }

    if (!loggedInState) {
        return <div>Please log in to access this page.</div>;
    }

    return props.children;
}