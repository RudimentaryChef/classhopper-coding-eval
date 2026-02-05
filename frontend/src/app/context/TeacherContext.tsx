'use client'
import {
    createContext,
    ReactNode,
    Reducer,
    useContext,
    useEffect,
    useReducer,
    useState,
} from 'react'

import { toast } from 'sonner'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'

type TeacherContextType = {

}

export const TeacherContext = createContext<any>(null)
export const useTeacherContext = () => useContext(TeacherContext)

export const TeacherProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const user = useUser()



    return <TeacherContext.Provider value={{}}>{children}</TeacherContext.Provider>
}