import { useState, useEffect } from "react"
import { db } from "../data/firebase"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Save,
  X,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  FileText,
  HelpCircle,
} from "lucide-react"

const TestList = () => {
  const [tests, setTests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"))
        const fetchedTests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isEditing: false,
          newQuestion: "",
          newOptions: [],
          newCorrectAnswer: "",
        }))
        setTests(fetchedTests)
      } catch (error) {
        console.error("Testlarni yuklashda xatolik:", error)
        showAlert("Testlarni yuklashda xatolik yuz berdi.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTests()
  }, [])

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000)
  }

  const handleEditTest = (id) => {
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id
          ? {
              ...test,
              isEditing: true,
              newQuestion: test.question,
              newOptions: [...test.options],
              newCorrectAnswer: test.correctAnswer,
            }
          : test,
      ),
    )
  }

  const saveEditTest = async (id) => {
    const testToEdit = tests.find((test) => test.id === id)
    if (!testToEdit || !testToEdit.newQuestion || !testToEdit.newOptions.length || !testToEdit.newCorrectAnswer) return

    try {
      const testRef = doc(db, "questions", id)
      await updateDoc(testRef, {
        question: testToEdit.newQuestion,
        options: testToEdit.newOptions,
        correctAnswer: testToEdit.newCorrectAnswer,
      })

      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === id
            ? {
                ...test,
                question: testToEdit.newQuestion,
                options: testToEdit.newOptions,
                correctAnswer: testToEdit.newCorrectAnswer,
                isEditing: false,
              }
            : test,
        ),
      )
      showAlert("Test muvaffaqiyatli o'zgartirildi!", "success")
    } catch (error) {
      console.error("Savolni o'zgartirishda xatolik:", error)
      showAlert("Savolni o'zgartirishda xatolik yuz berdi.", "error")
    }
  }

  const cancelEditTest = (id) => {
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id
          ? {
              ...test,
              isEditing: false,
              newQuestion: "",
              newOptions: [],
              newCorrectAnswer: "",
            }
          : test,
      ),
    )
  }

  const handleOptionChange = (id, optionIndex, newValue) => {
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id
          ? {
              ...test,
              newOptions: test.newOptions.map((opt, idx) => (idx === optionIndex ? newValue : opt)),
            }
          : test,
      ),
    )
  }

  const handleCorrectAnswerChange = (id, newValue) => {
    setTests((prevTests) => prevTests.map((test) => (test.id === id ? { ...test, newCorrectAnswer: newValue } : test)))
  }

  const handleDeleteTest = async (id) => {
    const confirmDelete = window.confirm("Bu testni o'chirishni istaysizmi?")
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "questions", id))
      setTests((prevTests) => prevTests.filter((test) => test.id !== id))
      showAlert("Test muvaffaqiyatli o'chirildi!", "success")
    } catch (error) {
      console.error("Testni o'chirishda xatolik:", error)
      showAlert("Testni o'chirishda xatolik yuz berdi.", "error")
    }
  }

  const getOptionLetter = (index) => String.fromCharCode(65 + index) // A, B, C, D

  const filteredTests = tests.filter((test) => test.question.toLowerCase().includes(searchTerm.toLowerCase()))

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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Testlar Ro'yxati</h1>
                <p className="text-gray-500">Barcha savollarni ko'ring va tahrirlang</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/addquiz"
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi savol</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Orqaga qaytish</span>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Jami savollar</p>
                  <p className="text-2xl font-bold text-blue-700">{tests.length}</p>
                </div>
                <HelpCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Faol savollar</p>
                  <p className="text-2xl font-bold text-green-700">{tests.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Tahrirlangan</p>
                  <p className="text-2xl font-bold text-purple-700">{tests.filter((test) => test.isEditing).length}</p>
                </div>
                <Edit3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

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

        {/* Tests List */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchTerm ? "Qidiruv natijalari topilmadi" : "Hech qanday savol mavjud emas"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Qidiruv shartlaringizga mos savol topilmadi."
                  : "Birinchi savolingizni qo'shish uchun yuqoridagi tugmani bosing."}
              </p>
            </div>
          ) : (
            filteredTests.map((test, index) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {test.isEditing ? (
                    <div className="space-y-4">
                      {/* Edit Question */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Savol:</label>
                        <textarea
                          value={test.newQuestion}
                          onChange={(e) =>
                            setTests((prevTests) =>
                              prevTests.map((t) => (t.id === test.id ? { ...t, newQuestion: e.target.value } : t)),
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Edit Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Javob variantlari:</label>
                        <div className="space-y-3">
                          {test.newOptions.map((option, optionIndex) => (
                            <div key={optionIndex} className="relative">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{getOptionLetter(optionIndex)}</span>
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(test.id, optionIndex, e.target.value)}
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
                          value={test.newCorrectAnswer}
                          onChange={(e) => handleCorrectAnswerChange(test.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">To'g'ri javobni tanlang</option>
                          {test.newOptions.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {getOptionLetter(optionIndex)}: {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Edit Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => saveEditTest(test.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Saqlash</span>
                        </button>
                        <button
                          onClick={() => cancelEditTest(test.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Bekor qilish</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Question Display */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-relaxed">
                              {test.question}
                            </h3>

                            {/* Options Display */}
                            <div className="grid md:grid-cols-2 gap-3 mb-4">
                              {test.options?.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 ${
                                    option === test.correctAnswer
                                      ? "border-green-300 bg-green-50"
                                      : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                      option === test.correctAnswer
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-300 text-gray-700"
                                    }`}
                                  >
                                    {getOptionLetter(optionIndex)}
                                  </div>
                                  <span className="text-gray-700">{option}</span>
                                  {option === test.correctAnswer && (
                                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Correct Answer Highlight */}
                            <div className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600">To'g'ri javob:</span>
                              <span className="font-semibold text-green-700">{test.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEditTest(test.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>O'zgartirish</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>O'chirish</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TestList;