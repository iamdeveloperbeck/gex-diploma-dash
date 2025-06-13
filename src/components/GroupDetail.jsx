import React, { useEffect, useState, useRef } from "react"
import { onSnapshot, collection } from "firebase/firestore"
import { Link, useParams } from "react-router-dom"
import { db } from "../data/firebase"
import html2pdf from "html2pdf.js"
import {
  Search,
  Download,
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  ArrowRight,
} from "lucide-react"

export default function GroupDetail() {
  const { id } = useParams()
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("grade")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterGrade, setFilterGrade] = useState("all")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState({})
  const answerSheetRefs = useRef({})

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "results"), (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const newResult = resultList.filter((list) => list.group_id === id)
      setResults(newResult)
      setFilteredResults(newResult)
    })

    return () => unsubscribe()
  }, [id])

  useEffect(() => {
    let filtered = results.filter((r) => {
      const matchesSearch = `${r.name} ${r.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = filterGrade === "all" || r.grade.toString() === filterGrade
      return matchesSearch && matchesGrade
    })

    filtered = filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredResults(filtered)
  }, [results, searchTerm, sortBy, sortOrder, filterGrade])

  const generatePdf = async (resultId, name, surname) => {
    setIsGeneratingPdf((prev) => ({ ...prev, [resultId]: true }))

    const ref = answerSheetRefs.current[resultId]
    if (ref && ref.current) {
      console.log(ref.current)
      await new Promise((resolve) => setTimeout(resolve, 600))
      const opt = {
        margin: 0.5,
        filename: `${name}_${surname}_javoblar_varaqasi.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }
      try {
        await html2pdf().set(opt).from(ref.current).save()
      } catch (error) {
        console.error("PDF yaratishda xatolik:", error)
        alert("PDF yaratishda xatolik yuz berdi.")
      }
    } else {
      alert("PDF yaratish uchun element topilmadi.")
    }

    setIsGeneratingPdf((prev) => ({ ...prev, [resultId]: false }))
  }

  const getScoreColor = (score) => {
    switch (score) {
      case 5:
        return "bg-green-500"
      case 4:
        return "bg-blue-500"
      case 3:
        return "bg-yellow-500"
      case 2:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getScoreIcon = (score) => {
    switch (score) {
      case 5:
        return <Trophy className="w-5 h-5 text-white" />
      case 4:
        return <Medal className="w-5 h-5 text-white" />
      case 3:
        return <Award className="w-5 h-5 text-white" />
      default:
        return <span className="text-white font-bold">{score}</span>
    }
  }

  const getPerformanceLevel = (correctCount, totalQuestions) => {
    const percentage = (correctCount / totalQuestions) * 100
    if (percentage >= 86) return { level: "A'lo", color: "text-green-600", bg: "bg-green-50" }
    if (percentage >= 71) return { level: "Yaxshi", color: "text-blue-600", bg: "bg-blue-50" }
    if (percentage >= 55) return { level: "Qoniqarli", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "Qoniqarsiz", color: "text-red-600", bg: "bg-red-50" }
  }

  const renderAnswerSheet = (result) => {
    if (!answerSheetRefs.current[result.id]) {
      answerSheetRefs.current[result.id] = React.createRef()
    }

    // Yetishmayotgan savollarni to'ldirish uchun to'liq javoblar massivini yaratish
    const expectedTotalQuestions = result.questionsLimit || result.totalQuestions || 100
    const actualAnswers = result.answers || []

    // To'liq javoblar massivini yaratish
    const completeAnswers = []
    for (let i = 0; i < expectedTotalQuestions; i++) {
      if (i < actualAnswers.length) {
        // Mavjud javob
        completeAnswers.push(actualAnswers[i])
      } else {
        // Yetishmayotgan javob uchun bo'sh element
        completeAnswers.push({
          question: `Savol ${i + 1}`,
          selectedAnswer: null,
          correctAnswer: "A", // Default qiymat
          isCorrect: false,
          section: "Javob berilmagan",
        })
      }
    }

    const getBubble = (label, selected) => {
      // Agar javob berilmagan bo'lsa
      if (!selected.selectedAnswer) {
        return "w-3 h-3 flex items-center justify-center rounded-full border border-black bg-white"
      }

      // To'g'ri javob va to'g'ri tanlangan
      if (selected.selectedAnswer === label && selected.isCorrect) {
        return "w-3 h-3 flex items-center justify-center rounded-full border border-black bg-black"
      }

      // Noto'g'ri javob tanlangan
      if (selected.selectedAnswer === label && !selected.isCorrect) {
        return "w-3 h-3 flex items-center justify-center rounded-full border border-red-500 bg-red-500"
      }

      // Boshqa variantlar
      return "w-3 h-3 flex items-center justify-center rounded-full border border-black bg-white"
    }

    const actualAnsweredQuestions = actualAnswers.length
    const correctCount = actualAnswers.reduce((count, answer) => {
      return answer.isCorrect ? count + 1 : count
    }, 0)
    const actualIncorrectCount = actualAnsweredQuestions - correctCount
    const unansweredCount = expectedTotalQuestions - actualAnsweredQuestions
    const totalIncorrectCount = actualIncorrectCount + unansweredCount // Noto'g'ri + javob berilmagan

    const grade = result.grade || 2

    return (
      <div ref={answerSheetRefs.current[result.id]} className="bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">Javoblar Varaqasi</h2>
        <div className="text-sm mb-3">
          <strong>Ism Familiya:</strong> {result.name} {result.surname} <br />
          <strong>Guruh:</strong> {result.group}
        </div>
        <div className="border p-3">
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 ml-5 mb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-[10px]">
                {["A", "B", "C", "D"].map((letter) => (
                  <span key={letter}>{letter}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {completeAnswers.map((selected, index) => {
              return (
                <div key={index} className="flex items-center gap-2">
                  <p className="text-[10px] font-medium mb-1">{index + 1 < 10 ? `0${index + 1}` : index + 1}</p>
                  <div className="flex gap-2 mt-[6px]">
                    {["A", "B", "C", "D"].map((letter) => (
                      <div key={letter} className={getBubble(letter, selected)}></div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[14px]">
            <strong>Izoh:</strong> 56% dan 70% gacha 3 baho, 71% dan 84% gacha 4 baho, 85% va undan yuqori 5 baho
          </p>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-[16px]">
              To'g'ri javoblar: <strong>{correctCount}</strong>
            </p>
            <p className="text-[16px]">
              Noto'g'ri javoblar: <strong>{totalIncorrectCount}</strong>
            </p>
            <p className="text-[16px]">
              Baho: <strong>{grade}</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Statistics calculations
  const averageGrade = results.length > 0 ? results.reduce((sum, result) => sum + result.grade, 0) / results.length : 0
  const topPerformers = results.filter((result) => result.grade === 5).length
  const totalStudents = results.length

  const groupName = results.length > 0 ? results[0].group : "Guruh"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Ortga qaytish</span>
              </Link>
              <Link
                to="/stdmngt"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="font-medium">Tahrirlash</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Guruh natijalari</h1>
                <p className="text-gray-500">{groupName}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Jami talabalar</p>
                  <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">A'lo baholar</p>
                  <p className="text-2xl font-bold text-green-700">{topPerformers}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">O'rtacha baho</p>
                  <p className="text-2xl font-bold text-purple-700">{averageGrade.toFixed(1)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ism yoki familiya bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Barcha baholar</option>
                <option value="5">5 - A'lo</option>
                <option value="4">4 - Yaxshi</option>
                <option value="3">3 - Qoniqarli</option>
                <option value="2">2 - Qoniqarsiz</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-")
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="grade-desc">Baho (Yuqoridan pastga)</option>
                <option value="grade-asc">Baho (Pastdan yuqoriga)</option>
                <option value="name-asc">Ism (A-Z)</option>
                <option value="name-desc">Ism (Z-A)</option>
                <option value="date-desc">Sana (Yangi)</option>
                <option value="date-asc">Sana (Eski)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-4">
          {filteredResults.map((result, index) => {
            const correctCount =
              result.answers?.reduce((count, answer) => {
                return answer.isCorrect ? count + 1 : count
              }, 0) || 0
            const totalQuestions = result.answers?.length || 0
            const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
            const performance = getPerformanceLevel(correctCount, totalQuestions)
            const resultDate = new Date(result.date).toLocaleDateString("uz-UZ")

            return (
              <div
                key={result.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 capitalize">
                            {result.name} {result.surname}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {result.group}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {resultDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Performance Badge */}
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${performance.bg} ${performance.color}`}
                      >
                        {performance.level}
                      </div>

                      {/* Score Display */}
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full ${getScoreColor(result.grade)} flex items-center justify-center shadow-lg`}
                        >
                          {getScoreIcon(result.grade)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Ball: {result.grade}</p>
                      </div>

                      {/* Statistics */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{percentage.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">
                          {correctCount}/{totalQuestions}
                        </p>
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => generatePdf(result.id, result.name, result.surname)}
                        disabled={isGeneratingPdf[result.id]}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPdf[result.id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span className="hidden md:inline">
                          {isGeneratingPdf[result.id] ? "Yuklanmoqda..." : "PDF yuklab olish"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>To'g'ri javoblar</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(result.grade)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Answer Statistics */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        To'g'ri: <span className="font-semibold text-green-600">{correctCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-600">
                        Noto'g'ri: <span className="font-semibold text-red-600">{totalQuestions - correctCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hidden Answer Sheet for PDF */}
                <div className="hidden">{renderAnswerSheet(result)}</div>
              </div>
            )
          })}
        </div>

        {filteredResults.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Natija topilmadi</h3>
            <p className="text-gray-500">
              {searchTerm || filterGrade !== "all"
                ? "Qidiruv shartlaringizga mos natija mavjud emas."
                : "Hali hech qanday test natijalari mavjud emas."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
