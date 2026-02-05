"use client"
import { useUser } from "@clerk/nextjs"
import Navbar from "../components/Navbar"
import RegisteredClasses from "./RegisteredClasses"
import SavedClasses from "./SavedClasses"

const Profile = () => {
    const { user, isLoaded, isSignedIn } = useUser()

    if (!isSignedIn) {
        <div>not signed in</div>
    }

    if (!isLoaded) {
        <div>loading...</div>
    }

    return (
        <>
            <Navbar scrollable={true} fixed={false} />
            <div>{JSON.stringify(user)}</div>
            <RegisteredClasses user_id={user?.id as string} />
            <SavedClasses user_id={user?.id as string} />
        </>
    )
}

export default Profile