import { useContext } from 'react'
import { GlobalContext } from 'src/@core/context/globalContext'
import { GlobalDataContextValue } from 'src/@core/utils/type'

export const useGlobalData = (): GlobalDataContextValue => useContext(GlobalContext)
