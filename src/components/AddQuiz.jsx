import { useState, useEffect } from "react"
import { db } from "../data/firebase"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { Link } from "react-router-dom"
import {
  Plus,
  BookOpen,
  ArrowLeft,
  List,
  CheckCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
  FileText,
  Save,
  Layers
} from "lucide-react";

const AddQuiz = () => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [section, setSection] = useState("") // Yangi section state
  const [sectionsList, setSectionsList] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sections"))
      const sectionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSectionsList(sectionsData)
    } catch (error) {
      console.error("Fanlarni olishda xatolik:", error)
    }
  }

  fetchSections()
}, [])

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options]
    updatedOptions[index] = value
    setOptions(updatedOptions)
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!question || options.some((opt) => opt === "") || !correctAnswer || !section) {
      showAlert("Iltimos, barcha maydonlarni to'ldiring!", "error")
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "questions"), {
        question,
        options,
        correctAnswer,
        section, // Section ham saqlanadi
      })
      showAlert("Savol muvaffaqiyatli qo'shildi!", "success")
      setQuestion("")
      setOptions(["", "", "", ""])
      setCorrectAnswer("")
      // setSection("")
    } catch (error) {
      console.error("Savolni qo'shishda xatolik yuz berdi:", error)
      showAlert("Xatolik yuz berdi. Qayta urinib ko'ring.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getOptionLetter = (index) => String.fromCharCode(65 + index) // A, B, C, D

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Yangi Savol Qo'shish</h1>
                <p className="text-gray-500">Test uchun yangi savol yarating</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/viewtest"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
              >
                <List className="w-4 h-4" />
                <span>Testlar ro'yhati</span>
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

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span>Savol yaratish</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span>Saqlash</span>
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
              {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Quiz Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Savol ma'lumotlari</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="section"
                className="flex items-center space-x-2 text-sm font-semibold text-gray-700"
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Fanni tanlang:</span>
              </label>
              <div className="relative">
                <select
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white appearance-none transition-colors"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Fanni tanlang</option>
                  {sectionsList.map((sec) => (
                    <option key={sec.id} value={sec.name}>
                      {sec.name}
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
            {/* Question */}
            <div className="space-y-3">
              <label htmlFor="question" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                <span>Savol nomi:</span>
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Savolingizni bu yerga yozing..."
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-6">
              <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <BookOpen className="w-4 h-4" />
                <span>Javob variantlari:</span>
              </h3>
              <div className="grid gap-4">
                {options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <label htmlFor={`option${index + 1}`} className="block text-sm font-medium text-gray-600">
                      {getOptionLetter(index)}-variant:
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{getOptionLetter(index)}</span>
                      </div>
                      <input
                        type="text"
                        id={`option${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`${getOptionLetter(index)} variantini kiriting...`}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div className="space-y-3">
              <label
                htmlFor="correctAnswer"
                className="flex items-center space-x-2 text-sm font-semibold text-gray-700"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>To'g'ri javob:</span>
              </label>
              <div className="relative">
                <select
                  id="correctAnswer"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white appearance-none transition-colors"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">To'g'ri javobni tanlang</option>
                  {options.map((option, index) => (
                    <option key={index} value={option} disabled={!option.trim()}>
                      {option.trim()
                        ? `${getOptionLetter(index)}: ${option}`
                        : `${getOptionLetter(index)}-variant (bo'sh)`}
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

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Qo'shilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Savolni saqlash</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Maslahatlar:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Savolni aniq va tushunarli qilib yozing</li>
                <li>• Barcha javob variantlarini to'ldiring</li>
                <li>• To'g'ri javobni diqqat bilan tanlang</li>
                <li>• Savolda grammatik xatolarga yo'l qo'ymang</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddQuiz