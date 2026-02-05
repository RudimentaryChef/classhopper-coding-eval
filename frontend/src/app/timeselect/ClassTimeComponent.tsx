"use client"
import { useState } from "react"
import ClassTimeCheckout from "./ClassTimeCheckout"
import ClassTimeDisplay from "./ClassTimeDisplay"
import { ClassTime } from "../types"


type ClassTimeComponentProps = {
    class_id: string
}
const ClassTimeComponent = ({ class_id }: ClassTimeComponentProps) => {
    const [selectedTimes, setSelectedTimes] = useState<ClassTime[]>([])

    return (
        <div className='flex flex-row w-screen h-screen justify-between px-2 py-1 md:px-4 md:py-2 lg:px-8 lg:py-4'>
            <ClassTimeDisplay selectedTimes={selectedTimes} setSelectedTimes={setSelectedTimes} class_id={class_id} />
            <ClassTimeCheckout selectedTimes={selectedTimes} setSelectedTimes={setSelectedTimes} />
        </div>
    )
}

export default ClassTimeComponent