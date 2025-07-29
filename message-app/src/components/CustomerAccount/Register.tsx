// ** React Imports
import { Dispatch, SetStateAction, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Components
import { yupResolver } from '@hookform/resolvers/yup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiCard, { CardProps } from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { postAxios } from 'src/fetcher'
import * as yup from 'yup'

// ** Icons Imports
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import EyeOutline from 'mdi-material-ui/EyeOutline'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

import { setCookie } from 'cookies-next'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import auth from 'src/configs/firebase'
import { State } from 'src/pages/login'
import { ACCESS_TOKEN, INVALID_CREDIT, REGISTER_USER_END_POINT } from 'src/utils/const'
import { b64, generateKeyPair, getPublicKey, storePrivateKey } from 'src/utils/function'

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

type FormRegisterData = {
  email: string
  name: string
  avatar?: string
  password: string
}

type Props = {
  setState: Dispatch<SetStateAction<State>>
}

const RegisterForm = ({ setState }: Props) => {
  // ** State
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().required(),
    avatar: yup.string(),
    password: yup.string().min(5).required()
  })

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormRegisterData>({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // ** Hook
  const router = useRouter()

  const handleLogin = async (registerData: FormRegisterData) => {
    try {
      const keyPair = await generateKeyPair()
      await storePrivateKey(keyPair)
      const publicKey = await getPublicKey(keyPair)

      const postUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}${REGISTER_USER_END_POINT}`
      const { success, data } = await postAxios(
        postUrl,
        {
          ...registerData,
          publicKey: b64(publicKey)
        },
        undefined,
        true
      )

      if (!success) {
        toast.error((data as { message: string }).message)

        return
      }

      const { user } = await signInWithEmailAndPassword(auth, registerData.email, registerData.password)
      const accessToken = await user.getIdToken()
      setCookie(ACCESS_TOKEN, accessToken)
      toast.success((data as { message: string }).message)
      router.push('/')
    } catch (error) {
      console.log(error)
      const errorData = error as FirebaseError
      if (errorData.code == INVALID_CREDIT) {
        toast.error('Email or password are wrong')
      } else {
        toast.error('Can not login right now')
      }
    }
  }

  return (
    <Box className='content-center'>
      <ToastContainer />
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Welcome to {themeConfig.templateName}! 👋🏻
            </Typography>
            <Typography variant='body2'>Please register account and start the adventure</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(data => handleLogin(data))}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    autoFocus
                    label='Email'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.email)}
                    placeholder='admin@materialize.com'
                  />
                )}
              />
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    autoFocus
                    label='Name'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.name)}
                    placeholder='John'
                  />
                )}
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='avatar'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    autoFocus
                    label='Avatar'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.name)}
                    placeholder='John'
                  />
                )}
              />
              {errors.avatar && <FormHelperText error>{errors.avatar.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                Password
              </InputLabel>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <OutlinedInput
                    value={value}
                    onBlur={onBlur}
                    label='Password'
                    onChange={onChange}
                    id='auth-login-v2-password'
                    error={Boolean(errors.password)}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                )}
              />
              {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
            </FormControl>
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7, mt: 5 }}>
              Register
            </Button>
            <Box display={'flex'} justifyContent={'center'}>
              <Typography
                variant='overline'
                sx={{ fontWeight: 600, marginBottom: 1.5 }}
                style={{ cursor: 'pointer' }}
                onClick={() => setState(State.LOGIN)}
              >
                {'Login'}
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RegisterForm
