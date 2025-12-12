
import {
    AppConfig,
    showConnect,
    type UserData,
    UserSession
} from "@stacks/connect"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";




const appConfig = new AppConfig(["store_write", "publish_data"])
const userSession = new UserSession({ appConfig })


export function useAuth() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const navigate = useNavigate();

    const appDetails = {
        name: "StackNStay",
        icon: "/favicon.png"
    };


    const connectWallet = () => {
        showConnect({
            appDetails,
            onFinish: () => {
                // Use client-side navigation to avoid full-page reloads
                navigate('/properties');
            },
            userSession
        })
    }

    const disconnectWallet = () => {
        userSession.signUserOut();
        setUserData(null);
        // Use client-side navigation to avoid full reload
        navigate('/');
    }


    useEffect(() => {
        if (userSession.isSignInPending()) {
            userSession.handlePendingSignIn().then((userData) => {
                setUserData(userData);
                // Navigate to properties after sign-in completes
                navigate('/properties');
            });
        } else if (userSession.isUserSignedIn()) {
            setUserData(userSession.loadUserData());
        }
    }, []);


    return {
        userData,
        appDetails,
        connectWallet,
        disconnectWallet
    }
}