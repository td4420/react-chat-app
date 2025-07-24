import { Box, Typography } from '@mui/material'

type Props = {
  title: string
}
const Title = ({title}: Props) => {
  return (
    <Box mb={5} textAlign={'center'}>
      <Typography fontSize={30} fontWeight={'bold'}>{title}</Typography>
    </Box>
  )
}

export default Title
