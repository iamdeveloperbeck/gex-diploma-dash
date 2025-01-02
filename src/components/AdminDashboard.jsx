import { useState, useEffect } from "react"
import { db } from '../data/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { Link } from "react-router-dom"

export default function AdminDashboard() {
  const [groups, setGroups] = useState([])
  const [newGroup, setNewGroup] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupSnapshot = await getDocs(collection(db, 'groups'))
        const groupList = groupSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }))
        setGroups(groupList)
      } catch (error) {
        showAlert("Failed to fetch groups. Please try again.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const handleAddGroup = async () => {
    if (!newGroup.trim()) return

    setIsSubmitting(true)
    try {
      const docRef = await addDoc(collection(db, 'groups'), { 
        name: newGroup.trim() 
      })
      
      setGroups([...groups, { id: docRef.id, name: newGroup.trim() }])
      setNewGroup('')
      
      showAlert("Guruh muvaffaqiyatli qo'shildi.", "success")
    } catch (error) {
      showAlert("Guruh qo‘shib bo‘lmadi. Iltimos, qayta urinib koʻring.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Admin boshqaruv paneli
          </h1>
          <Link to='/addquiz' className="text-sm text-blue-600 hover:text-blue-800 hover:underline">Savol qo'shish</Link>
        </div>

        {/* Alert */}
        {alert.show && (
          <div className={`p-4 rounded-md ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {alert.message}
          </div>
        )}

        {/* Add Group Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Guruh qo'shish</h2>
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleAddGroup()
            }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <input
              type="text"
              placeholder="Yangi guruh nomi"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newGroup.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Qo'shilmoqda..." : "Guruh qo'shish"}
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Guruhlar</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Hech qanday guruh qo'shilmagan. Yuqoridagi birinchi guruhingizni qo'shing.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between py-4"
                >
                  <span className="text-sm font-medium">{group.name}</span>
                  <Link to={group.id} className="text-sm text-blue-600 hover:text-blue-800">
                    Tafsilotlarni ko'rish
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}