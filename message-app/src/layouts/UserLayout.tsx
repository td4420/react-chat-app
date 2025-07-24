// ** React Imports
import { ReactNode, useCallback } from 'react'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import VerticalLayout from 'src/@core/layouts/VerticalLayout'

// ** Navigation Imports
import { VerticalNavItemsType } from 'src/@core/layouts/types'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useGlobalData } from 'src/@core/hooks/useGlobalData'
import { useSettings } from 'src/@core/hooks/useSettings'

import { CashMultiple } from 'mdi-material-ui'

interface Props {
  children: ReactNode
}

const UserLayout = ({ children }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/components/use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const {
    globalData: { rooms }
  } = useGlobalData()

  const getNavigation = useCallback((): VerticalNavItemsType => {
    const sections: VerticalNavItemsType = [
      {
        sectionTitle: 'Messages'
      }
    ]

    rooms.map(room => {
      sections.push({
        title: room.name,
        icon: CashMultiple,
        path: `messages/${room.id}`,
        openInNewTab: false
      })
    })

    return sections
  }, [rooms])

  return (
    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={getNavigation()} // Navigation Items
      verticalAppBarContent={() => <VerticalAppBarContent />}
    >
      {children}
    </VerticalLayout>
  )
}

export default UserLayout
