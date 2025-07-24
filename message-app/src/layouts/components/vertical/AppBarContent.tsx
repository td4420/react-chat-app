// ** MUI Imports
import Box from '@mui/material/Box'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'

const AppBarContent = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <UserDropdown />
    </Box>
  )
}

export default AppBarContent
