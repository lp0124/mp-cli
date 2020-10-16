import { setProvider } from '@/libs/mpext'
import store from '@/store/index'

setProvider({
  store,
  namespace: '$store',
})
