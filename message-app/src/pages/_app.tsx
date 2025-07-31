// ** Next Imports
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import { useState } from 'react'
import Spinner from 'src/@core/spinner'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import UserLayout from 'src/layouts/UserLayout'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import auth from 'src/configs/firebase'
import { ACCESS_TOKEN, LOGIN_PAGE } from 'src/utils/const'
import '../../styles/globals.css'
import { User } from 'firebase/auth'
import { deleteCookie, setCookie } from 'cookies-next'
import { GlobalDataProvider } from 'src/@core/context/globalContext'
import { WebsocketProvider } from 'src/@core/context/websocketContext'
import { removePrivateKey } from 'src/utils/function'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)

  auth.onAuthStateChanged(user => {
    if (user) {
      if (router.asPath == LOGIN_PAGE) {
        router.push('/').then(() => {
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    } else {
      if (router.asPath !== LOGIN_PAGE) {
        router.push(LOGIN_PAGE).then(() => {
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }
  })

  const onIdTokenChanged = async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken()
      setCookie(ACCESS_TOKEN, token)
    } else {
      deleteCookie(ACCESS_TOKEN)
      await removePrivateKey()
    }
  }

  auth.onIdTokenChanged(onIdTokenChanged)

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  return loading ? (
    <Spinner />
  ) : (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <GlobalDataProvider>
        <WebsocketProvider>
          <SettingsProvider>
            <SettingsConsumer>
              {({ settings }) => {
                return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </WebsocketProvider>
      </GlobalDataProvider>
    </CacheProvider>
  )
}

export default App
