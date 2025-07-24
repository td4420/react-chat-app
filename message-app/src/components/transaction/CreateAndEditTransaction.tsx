// ** MUI Imports
import { Button, FormControl, FormHelperText, FormLabel, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'

// ** Types Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Transaction, Prisma } from '@prisma/client'
import { useRouter } from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { postAxios } from 'src/fetcher'
import { TRANSACTION_PAGE } from 'src/utils/const'
import * as yup from 'yup'

type Props = {
  transaction?: Transaction
}

const EditForm = ({ transaction }: Props) => {
  const router = useRouter();

  const schema = yup.object().shape({
    memberId: yup.string().required(),
    amount: yup.string().required(),
    description: yup.string().required()
  })

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<Prisma.TransactionCreateInput>({
    mode: 'onBlur',
    defaultValues: transaction,
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: Prisma.TransactionCreateInput) => {
    const postUrl = transaction ?
    `${process.env.NEXT_PUBLIC_API_DOMAIN}/transaction/update/${transaction.id}`
    : `${process.env.NEXT_PUBLIC_API_DOMAIN}/transaction/create`;

    const {success, data: transactionUpdated} = await postAxios(postUrl, {
      ...data
    })

    if (success) {
      router.push(`${TRANSACTION_PAGE}/${(transactionUpdated as Transaction).id}`).then(() => {
        toast.success(`${transaction ? 'Update' : 'Create'} transaction success`)
      })
    } else {
      toast.error('Something wrong')
    }
  }

  return (
    <Card>
      <ToastContainer />
      <Box m={5}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(data => onSubmit(data))}>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel component='legend' error={Boolean(errors.memberId)}>
              Member ID
            </FormLabel>
            <Controller
              name='memberId'
              control={control}
              rules={{ required: true }}
              render={({ field }) =>
                <TextField
                  {...field}
                  type='string'
                  required
                />
              }
            />
            {errors.memberId && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.memberId?.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel component='legend' error={Boolean(errors.amount)}>
              Amount
            </FormLabel>
            <Controller
              name='amount'
              control={control}
              render={({ field }) =>
                <TextField
                  {...field}
                  type='string'
                />
              }
            />
            {errors.amount && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.amount?.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel component='legend' error={Boolean(errors.description)}>
              Description
            </FormLabel>
            <Controller
              name='description'
              control={control}
              render={({ field }) =>
                <TextField
                  {...field}
                  type='text'
                />
              }
            />
            {errors.description && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.description?.message}</FormHelperText>
            )}
          </FormControl>
          <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7, mt: 5 }}>
            Save
          </Button>
        </form>
      </Box>
    </Card>
  )
}

export default EditForm
