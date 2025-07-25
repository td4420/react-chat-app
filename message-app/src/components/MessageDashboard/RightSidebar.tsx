import { ExpansionPanel, Sidebar } from '@chatscope/chat-ui-kit-react'
import { useGlobalData } from 'src/@core/hooks/useGlobalData'

const RightSideBar = () => {
  const { currentRoom } = useGlobalData()

  return !currentRoom ? (
    <></>
  ) : (
    <Sidebar position='right'>
      <ExpansionPanel open title='INFO'>
        <p>Lorem ipsum</p>
        <p>Lorem ipsum</p>
        <p>Lorem ipsum</p>
        <p>Lorem ipsum</p>
      </ExpansionPanel>
    </Sidebar>
  )
}

export default RightSideBar
