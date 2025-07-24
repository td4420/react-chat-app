// ** Icon imports
import {
  AccountGroupOutline,
  AccountKeyOutline,
  AccountOutline,
  Console,
  DotsHorizontalCircleOutline,
  ForumOutline,
  ShapeOutline,
  Silverware,
  TagOutline,
  Web,
  CartOutline,
  CashMultiple
} from 'mdi-material-ui'
import HomeOutline from 'mdi-material-ui/HomeOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import {
  ADMIN_PAGE,
  CATEGORY_PAGE,
  COMMAND_PAGE,
  CONVERSATION_DATA_PAGE,
  DEMO_PAGE,
  DEPLOYER_PAGE,
  MEMBER_PAGE,
  MENU_PAGE,
  OPTION_PAGE,
  ORDER_PAGE,
  SKYPE_USER_PAGE,
  TAG_PAGE,
  TRANSACTION_PAGE
} from 'src/utils/const'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'CI/CD'
    },
    {
      title: 'Project',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Options',
      icon: DotsHorizontalCircleOutline,
      path: OPTION_PAGE,
      openInNewTab: false
    },
    {
      title: 'Demo Site',
      icon: Web,
      path: DEMO_PAGE,
      openInNewTab: false
    },
    {
      title: 'Deployer',
      icon: AccountKeyOutline,
      path: DEPLOYER_PAGE,
      openInNewTab: false
    },
    {
      title: 'Admin',
      icon: AccountKeyOutline,
      path: ADMIN_PAGE,
      openInNewTab: false
    },
    {
      sectionTitle: 'Skype Bot'
    },
    {
      title: 'Conversation Data',
      icon: ForumOutline,
      path: CONVERSATION_DATA_PAGE,
      openInNewTab: false
    },
    {
      sectionTitle: 'Hackathon Bot'
    },
    {
      title: 'Category',
      icon: ShapeOutline,
      path: CATEGORY_PAGE,
      openInNewTab: false
    },
    {
      title: 'Skype User',
      icon: AccountOutline,
      path: SKYPE_USER_PAGE,
      openInNewTab: false
    },
    {
      title: 'Tags',
      icon: TagOutline,
      path: TAG_PAGE,
      openInNewTab: false
    },
    {
      sectionTitle: 'ISCOOK BOT'
    },
    {
      title: 'Commands',
      icon: Console,
      path: COMMAND_PAGE,
      openInNewTab: false
    },
    {
      title: 'Members',
      icon: AccountGroupOutline,
      path: MEMBER_PAGE,
      openInNewTab: false
    },
    {
      title: 'Menu',
      icon: Silverware,
      path: MENU_PAGE,
      openInNewTab: false
    },
    {
      title: 'Order',
      icon: CartOutline,
      path: ORDER_PAGE,
      openInNewTab: false
    },
    {
      title: 'Transaction',
      icon: CashMultiple,
      path: TRANSACTION_PAGE,
      openInNewTab: false
    }
  ]
}

export default navigation
