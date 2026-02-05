"use server"

import { auth } from "@clerk/nextjs/server"
import axios from "axios"
import { User, UserInstructor } from "../types"

export async function getUser() {
    const { userId } = await auth()

    try {
        const user = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/users/filter`, {
            id: userId
        })

        return user.data[0] as User
    } catch (error: any) {
        console.log("fetching user by userId failed")
        console.log(JSON.stringify(error.response.data));
        return null
    }
}

export async function createTeacher(): Promise<number> {
    const { userId } = await auth()

    if (!userId) {
        return -1
    }

    // console.log("new teacher being created")
    try {
        const newInstructor = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/create`, {
            user_id: userId
        })
        // console.log(newInstructor.data)
        return newInstructor.data.id!
    } catch (error) {
        console.log(error)
        return -1
    }
}

export async function getTeacher() {
    const { userId } = await auth()

    if (!userId) {
        return null
    }

    try {
        const teacher = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
            user_id: userId
        })
        const user = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/instructor_and_user/${teacher.data[0].id}`)
        return user.data as UserInstructor
    } catch (error) {
        console.log("fetching teacher by userId failed")
        console.log(error)
        return null
    }
}

export async function getSeats(ts_id: number, start: string, end: string) {

    try {
        // Bug 13: Wrong field name - should be time_slot_id, not timeslot_id (snake_case mismatch)
        const seats = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/timeslot/availability`,
            {
                timeslot_id: ts_id,
                startTime: start,
                endTime: end
            })

        console.log(seats.data)
        return seats.data
    } catch (error) {
        console.log(error)
        return null
    }
}
