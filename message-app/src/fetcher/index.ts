import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import auth from 'src/configs/firebase'

export type ResponseResult<T> = {
  success: boolean
  message?: string
  data?: T | null
}

/**
 * Custom axios POST method.
 *
 * @param url : api url
 * @param data : post data
 * @param config : axios config
 *
 * Type <T> : response type
 * Type <D> : data type, normally Prisma.[...WhereInput]. Example Prisma.RoleWhereInput
 *
 * @returns ResponseResult<T>
 */
export const postAxios = async <T, D = undefined>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
  skipValidate?: boolean
): Promise<ResponseResult<T>> => {
  const headers: any = {
    ...config?.headers
  }

  if (!skipValidate) {
    const currentUser = auth.currentUser

    if (!currentUser) {
      return {
        message: 'User not login',
        success: false
      }
    }

    const token = await currentUser.getIdToken()
    headers['Authorization'] = `Bearer ${token}`
  }

  return await axios
    .post<ResponseResult<T>, AxiosResponse<ResponseResult<T>>, D>(url, data, {
      ...config,
      headers
    })
    .then(res => {
      return res.data
    })
    .catch((error: AxiosError<ResponseResult<T>>) => {
      return {
        message: error.response?.data?.message || 'Something wrong',
        success: false
      }
    })
}

export const getAxios = async <T, D = undefined>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<ResponseResult<T>> => {
  const headers: any = {
    ...config?.headers
  }

  const currentUser = auth.currentUser
  if (currentUser) {
    const token = await currentUser.getIdToken()
    headers['Authorization'] = `Bearer ${token}`
  }

  return await axios
    .get<ResponseResult<T>, AxiosResponse<ResponseResult<T>>, D>(url, {
      ...config,
      headers: {
        ...headers
      }
    })
    .then(res => {
      return res.data
    })
    .catch((error: AxiosError<ResponseResult<T>>) => {
      return {
        message: error.response?.data?.message || 'Something wrong',
        success: false
      }
    })
}
