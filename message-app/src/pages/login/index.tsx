// ** React Imports
import { ReactNode, useState } from 'react'

// ** MUI Components
import 'react-toastify/dist/ReactToastify.css'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

import LoginForm from 'src/components/CustomerAccount/Login'
import RegisterForm from 'src/components/CustomerAccount/Register'

export enum State {
  LOGIN = 'login',
  REGISTER = 'register'
}

const LoginPage = () => {
  // ** State
  const [state, setState] = useState<State>(State.LOGIN)
  if (state === State.LOGIN) {
    return <LoginForm setState={setState} />
  }

  return <RegisterForm setState={setState} />
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default LoginPage
