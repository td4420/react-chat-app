// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import { Box, Button } from '@mui/material'

// import { Room } from '@prisma/client'
import { useRouter } from 'next/router'
import Title from 'src/components/Title'
import { PROJECT_PAGE } from 'src/utils/const'

// type Props = {
//   rooms: Room[]
// }

const Dashboard = () => {
  const router = useRouter()
  const handleClick = () => {
    router.push(`${PROJECT_PAGE}/new`)
  }

  return (
    <ApexChartWrapper>
      <Title title={'Projects'} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box mb={5} display={'flex'} justifyContent={'flex-end'}>
            <Button onClick={handleClick} variant='contained'>
              Create new project
            </Button>
          </Box>
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default Dashboard
