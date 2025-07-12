import { useEffect, type PropsWithChildren } from "react";
import { useLoggedInState } from "../hooks/useIsLoggedIn"
import { useNavigate } from "react-router";

export const GuardMustBeLoggedOut = (props: PropsWithChildren) => {
    const nav = useNavigate();
    const loggedInState = useLoggedInState();

    useEffect(() => {
        if (loggedInState === "logged-in") {
            // redirect to home
            nav("/");
        }
    }, [loggedInState, nav]);

    if (loggedInState === "loading") {
        return <div>Loading...</div>;
    }

    if (loggedInState == "logged-in") {
        return <div>You are already logged in. Redirecting you...</div>;
    }

    return props.children;
}