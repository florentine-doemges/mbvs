import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Calendar from './pages/Calendar'
import Rooms from './pages/Rooms'
import RoomForm from './pages/RoomForm'
import Providers from './pages/Providers'
import ProviderForm from './pages/ProviderForm'
import Upgrades from './pages/Upgrades'
import UpgradeForm from './pages/UpgradeForm'
import Settings from './pages/Settings'
import Bookings from './pages/Bookings'

export const LOCATION_ID = '11111111-1111-1111-1111-111111111111'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/calendar" replace />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/new" element={<RoomForm />} />
          <Route path="rooms/:id" element={<RoomForm />} />
          <Route path="providers" element={<Providers />} />
          <Route path="providers/new" element={<ProviderForm />} />
          <Route path="providers/:id" element={<ProviderForm />} />
          <Route path="upgrades" element={<Upgrades />} />
          <Route path="upgrades/new" element={<UpgradeForm />} />
          <Route path="upgrades/:id" element={<UpgradeForm />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
