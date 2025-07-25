// ** MUI Imports

// ** Styled Component Import
import { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports

// import { Room } from '@prisma/client'
import MessageDashboard from 'src/components/MessageDashboard'

const Dashboard = () => {
  return (
    <ApexChartWrapper>
      <MessageDashboard />
    </ApexChartWrapper>
  )
}

Dashboard.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Dashboard
