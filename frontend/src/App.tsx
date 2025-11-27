import { useState } from 'react'
import Calendar from './pages/Calendar'

const LOCATION_ID = '11111111-1111-1111-1111-111111111111'

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Studio Mabella - Buchungssystem
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Calendar
          locationId={LOCATION_ID}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </main>
    </div>
  )
}

export default App
