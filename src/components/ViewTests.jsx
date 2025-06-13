import { useEffect, useState } from "react"
import { db } from "../data/firebase"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import {
  ArrowLeft,
  Layers,
  Search,
  Filter,
  BookOpen,
  CheckCircle,
  Eye,
  FileText,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"

const ViewTests = () => {
  const [tests, setTests] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [selectedSection, setSelectedSection] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [sections, setSections] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests
        const testsSnapshot = await getDocs(collection(db, "questions"))
        const testsData = testsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTests(testsData)
        console.log("Loaded tests:", testsData) // Debug log

        // Fetch sections
        const sectionsSnapshot = await getDocs(collection(db, "sections"))
        const sectionsData = sectionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setSections(sectionsData)
        console.log("Loaded sections:", sectionsData) // Debug log
      } catch (error) {
        console.error("Ma'lumotlarni olishda xatolik:", error)
        showAlert("Ma'lumotlarni yuklashda xatolik yuz berdi.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = tests

    if (selectedSection) {
      filtered = filtered.filter((test) => test.section === selectedSection)
      console.log(`Filtered by section "${selectedSection}":`, filtered) // Debug log
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.options.some((option) => option.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredTests(filtered)
  }, [selectedSection, searchTerm, tests])

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000)
  }

  const handleEdit = (test) => {
    setEditingId(test.id)
    setEditData({
      question: test.question,
      options: [...test.options],
      correctAnswer: test.correctAnswer,
      section: test.section || "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editData.question || !editData.options.every((opt) => opt.trim()) || !editData.correctAnswer) {
      showAlert("Barcha maydonlarni to'ldiring!", "error")
      return
    }

    try {
      const testRef = doc(db, "questions", editingId)
      await updateDoc(testRef, {
        question: editData.question,
        options: editData.options,
        correctAnswer: editData.correctAnswer,
        section: editData.section,
      })

      setTests((prev) =>
        prev.map((test) =>
          test.id === editingId
            ? {
                ...test,
                question: editData.question,
                options: editData.options,
                correctAnswer: editData.correctAnswer,
                section: editData.section,
              }
            : test,
        ),
      )

      setEditingId(null)
      setEditData({})
      showAlert("Test muvaffaqiyatli o'zgartirildi!", "success")
    } catch (error) {
      console.error("Testni o'zgartirishda xatolik:", error)
      showAlert("Testni o'zgartirishda xatolik yuz berdi.", "error")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleDelete = async (id, question) => {
    if (!window.confirm(`"${question.substring(0, 50)}..." savolini o'chirishni istaysizmi?`)) return

    setDeletingId(id)
    try {
      await deleteDoc(doc(db, "questions", id))
      setTests((prev) => prev.filter((test) => test.id !== id))
      showAlert("Test muvaffaqiyatli o'chirildi!", "success")
    } catch (error) {
      console.error("Testni o'chirishda xatolik:", error)
      showAlert("Testni o'chirishda xatolik yuz berdi.", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleOptionChange = (index, value) => {
    setEditData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) => (idx === index ? value : opt)),
    }))
  }

  const getOptionLetter = (index) => String.fromCharCode(65 + index) // A, B, C, D

  // Get tests count by section
  const getTestsCountBySection = (sectionName) => {
    return tests.filter((test) => test.section === sectionName).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <BookOpen className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Testlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Testlarni Ko'rish</h1>
                <p className="text-gray-500">Barcha savollar va javoblarni ko'ring</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga qaytish</span>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Jami savollar</p>
                  <p className="text-2xl font-bold text-blue-700">{tests.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Ko'rsatilgan</p>
                  <p className="text-2xl font-bold text-green-700">{filteredTests.length}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Fanlar</p>
                  <p className="text-2xl font-bold text-purple-700">{sections.length}</p>
                </div>
                <Layers className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Savollar ichida qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Section Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white appearance-none"
              >
                <option value="">Barcha fanlar</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.name}>
                    {section.name} ({getTestsCountBySection(section.name)} ta test)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Qo'shimcha ma'lumotlar:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p className="font-bold">Jami testlar: <span className="font-normal">{tests.length}</span></p>
              <p className="font-bold">Filtrlangan testlar: <span className="font-normal">{filteredTests.length}</span></p>
              <p className="font-bold">Tanlangan fan: <span className="font-normal">"{selectedSection}"</span></p>
              <p className="font-bold">Fanlar: <span className="font-normal">{sections.map((s) => s.name).join(", ")}</span></p>
              <p className="font-bold">Fanlarsiz kiritilgan testlar: <span className="font-normal">{tests.filter((t) => !t.section || t.section === "").length}</span></p>
            </div>
          </div>
        )}

        {/* Tests List */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchTerm || selectedSection ? "Hech qanday test topilmadi" : "Testlar mavjud emas"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedSection
                  ? "Qidiruv yoki filtr shartlaringizga mos test topilmadi."
                  : "Hali hech qanday test qo'shilmagan."}
              </p>
              {selectedSection && (
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  💡 "{selectedSection}" fanida hech qanday test yo'q. Yangi test qo'shishda bu fanni tanlang.
                </p>
              )}
            </div>
          ) : (
            filteredTests.map((test, index) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {editingId === test.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      {/* Edit Question */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Savol:</label>
                        <textarea
                          value={editData.question}
                          onChange={(e) => setEditData((prev) => ({ ...prev, question: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Edit Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fan:</label>
                        <select
                          value={editData.section}
                          onChange={(e) => setEditData((prev) => ({ ...prev, section: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                          <option value="">Fanni tanlang</option>
                          {sections.map((section) => (
                            <option key={section.id} value={section.name}>
                              {section.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Edit Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Javob variantlari:</label>
                        <div className="space-y-3">
                          {editData.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="relative">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{getOptionLetter(optionIndex)}</span>
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`${getOptionLetter(optionIndex)} variantini kiriting...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Edit Correct Answer */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To'g'ri javob:</label>
                        <select
                          value={editData.correctAnswer}
                          onChange={(e) => setEditData((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">To'g'ri javobni tanlang</option>
                          {editData.options?.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {getOptionLetter(optionIndex)}: {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Edit Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Saqlash</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Bekor qilish</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      {/* Question Header */}
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2 leading-relaxed">{test.question}</h3>
                          <div className="flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-purple-500" />
                            <span
                              className={`text-sm px-2 py-1 rounded-lg font-medium ${
                                test.section ? "text-purple-600 bg-purple-50" : "text-gray-500 bg-gray-100"
                              }`}
                            >
                              {test.section || "Fan belgilanmagan"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {test.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                              option === test.correctAnswer
                                ? "border-green-300 bg-green-50 shadow-sm"
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                option === test.correctAnswer ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {getOptionLetter(optionIndex)}
                            </div>
                            <span
                              className={`flex-1 ${
                                option === test.correctAnswer ? "text-green-800 font-semibold" : "text-gray-700"
                              }`}
                            >
                              {option}
                            </span>
                            {option === test.correctAnswer && <CheckCircle className="w-6 h-6 text-green-500" />}
                          </div>
                        ))}
                      </div>

                      {/* Correct Answer Summary */}
                      <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">
                            <span className="font-medium">To'g'ri javob:</span> {test.correctAnswer}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(test)}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>O'zgartirish</span>
                        </button>
                        <button
                          onClick={() => handleDelete(test.id, test.question)}
                          disabled={deletingId === test.id}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === test.id ? (
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
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTests.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Jami {filteredTests.length} ta test ko'rsatilmoqda
                {selectedSection && ` ${selectedSection} fanidan.`}
                {searchTerm && ` ("${searchTerm}" qidiruvi bo'yicha)`}
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>To'g'ri javob</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Boshqa variantlar</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewTests;
