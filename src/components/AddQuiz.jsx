import React, { useState } from "react"
import { db } from "../data/firebase"
import { collection, addDoc } from "firebase/firestore"
import { Link } from "react-router-dom"

const AddQuiz = () => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options]
    updatedOptions[index] = value
    setOptions(updatedOptions)
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!question || options.some((opt) => opt === "") || !correctAnswer) {
      showAlert("Iltimos, barcha maydonlarni to'ldiring!", "error")
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "questions"), {
        question,
        options,
        correctAnswer,
      })
      showAlert("Savol muvaffaqiyatli qo'shildi!", "success")
      setQuestion("")
      setOptions(["", "", "", ""])
      setCorrectAnswer("")
    } catch (error) {
      console.error("Savolni qo'shishda xatolik yuz berdi:", error)
      showAlert("Xatolik yuz berdi. Qayta urinib ko'ring.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Yangi Savol Qo'shish
          </h1>
          <div className="flex gap-4">
            <Link 
              to="/testlist" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Testlar ro'yhati
            </Link>
            <Link 
              to="/admin" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Orqaga qaytish
            </Link>
          </div>
        </div>

        {/* Alert */}
        {alert.show && (
          <div 
            className={`p-4 rounded-md ${
              alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* Quiz Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div className="space-y-1">
              <label 
                htmlFor="question"
                className="block text-sm font-medium text-gray-700"
              >
                Savol nomi:
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="space-y-1">
                  <label 
                    htmlFor={`option${index + 1}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {`${index + 1}-variant:`}
                  </label>
                  <input
                    type="text"
                    id={`option${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="space-y-1">
              <label 
                htmlFor="correctAnswer"
                className="block text-sm font-medium text-gray-700"
              >
                To'g'ri javob:
              </label>
              <select
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isSubmitting}
                required
              >
                <option value="">To'g'ri javobni tanlang</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option || `Variant ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddQuiz