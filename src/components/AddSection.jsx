import { useState, useEffect } from "react"
import { db } from "../data/firebase"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Plus, Trash2, Layers, CheckCircle, AlertTriangle, Loader2, FolderPlus, Archive, Hash, ArrowLeftFromLine } from "lucide-react"
import { Link } from "react-router-dom"

const AddSection = () => {
  const [sections, setSections] = useState([])
  const [sectionName, setSectionName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sections"))
      const sectionList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setSections(sectionList)
    } catch (error) {
      console.error("Qismlarni yuklashda xatolik:", error)
      showAlert("Qismlarni yuklashda xatolik yuz berdi.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000)
  }

  const handleAddSection = async () => {
    if (!sectionName.trim()) {
      showAlert("Qism nomini kiriting!", "error")
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "sections"), {
        name: sectionName.trim(),
        createdAt: new Date().toISOString(),
      })
      setSectionName("")
      await fetchSections()
      showAlert("Qism muvaffaqiyatli qo'shildi!", "success")
    } catch (error) {
      console.error("Qism qo'shishda xatolik:", error)
      showAlert("Qism qo'shishda xatolik yuz berdi.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSection = async (id, name) => {
    if (!window.confirm(`"${name}" qismini o'chirishni istaysizmi?`)) return

    setDeletingId(id)
    try {
      await deleteDoc(doc(db, "sections", id))
      await fetchSections()
      showAlert("Qism muvaffaqiyatli o'chirildi!", "success")
    } catch (error) {
      console.error("Qismni o'chirishda xatolik:", error)
      showAlert("Qismni o'chirishda xatolik yuz berdi.", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSection()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <Layers className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Qismlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Test fanlarni boshqarish</h1>
                <p className="text-gray-500">Test fanlarni yarating va boshqaring</p>
              </div>
            </div>
            <Link to='/admin' className="flex items-center gap-2">
                <ArrowLeftFromLine className="w-5 h-5 text-purple-600" />
                <span>Orqaga qaytish</span>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Jami fanlar</p>
                  <p className="text-2xl font-bold text-blue-700">{sections.length}</p>
                </div>
                <Archive className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Faol fanlar</p>
                  <p className="text-2xl font-bold text-green-700">{sections.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Yangi fanlar</p>
                  <p className="text-2xl font-bold text-purple-700">0</p>
                </div>
                <FolderPlus className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert.show && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 ${
              alert.type === "success"
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-400 text-red-700"
            } animate-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex items-center space-x-2">
              {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Section Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Yangi fan qo'shish</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-2">
                    Fan nomi
                  </label>
                  <input
                    id="sectionName"
                    type="text"
                    placeholder="Masalan: Lotin tili"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  onClick={handleAddSection}
                  disabled={isSubmitting || !sectionName.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Qo'shilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Fan qo'shish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Archive className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Mavjud fanlar</h2>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Hech qanday fan mavjud emas</h3>
                  <p className="text-gray-500 mb-4">
                    Birinchi faningizni qo'shish uchun chap tomondagi formadan foydalaning.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition-all duration-300 border border-gray-200 hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            <Hash className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {section.name}
                            </h3>
                            <p className="text-sm text-gray-500">Fan #{index + 1}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSection(section.id, section.name)}
                          disabled={deletingId === section.id}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === section.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>O'chirilmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>O'chirish</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Maslahatlar:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Fan nomlarini aniq va tushunarli qilib yozing</li>
                <li>• Har bir fan alohida mavzu yoki bo'limni ifodalashi kerak</li>
                <li>• Fanlarni o'chirishdan oldin ehtiyot bo'ling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSection;