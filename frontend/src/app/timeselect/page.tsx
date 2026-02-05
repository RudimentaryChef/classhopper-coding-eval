"use server"
import React from 'react'
import ClassTimeDisplay from './ClassTimeDisplay'
import ClassTimeCheckout from './ClassTimeCheckout'
import ClassTimeComponent from './ClassTimeComponent'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function page({ searchParams }: Props) {
    const class_id = (await searchParams).class_id as string;

    if (!class_id) {
        return (
            <div>
                <h1>Class ID not found</h1>
            </div>
        )
    }

    return (
        <ClassTimeComponent class_id={class_id} />
    )
}

export default page