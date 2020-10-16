import { promisifyArr } from '@/helpers/promisify'
import storage from './storage'

const p = promisifyArr(['getLocation'])

export async function getLocation() {
  const res = await p.getLocation()
  storage.set('location', {
    latitude: res.latitude,
    longitude: res.longitude,
  })
  return res
}
