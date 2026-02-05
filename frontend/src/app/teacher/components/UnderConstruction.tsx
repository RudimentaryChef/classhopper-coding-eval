import React from 'react'
import { Construction } from 'lucide-react'

type Props = {}

const UnderConstruction = (props: Props) => {
    return (
        <div className='w-full h-full flex items-start justify-center p-12'>
            <div className='flex flex-col items-center justify-center h-full w-full border rounded-md bg-muted'>
                <Construction size={100} className='text-gray-500 mb-4' />
                <h1 className='text-2xl font-bold text-center md:text-4xl'>Under Construction</h1>
                <p className='text-sm mt-2 text-center md:text-lg w-full px-6'>This page is currently under construction. Please check back later.</p>
            </div>
        </div>
    )
}

export default UnderConstruction