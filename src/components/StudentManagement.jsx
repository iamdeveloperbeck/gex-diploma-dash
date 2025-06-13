import { useEffect, useState } from "react"
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore"
import { db } from "../data/firebase"
import {
  Search,
  Edit3,
  Trash2,
  UserCheck,
  Users,
  BookOpen,
  AlertTriangle,
  Save,
  X,
  ArrowRight,
  History,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Link } from "react-router-dom"

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [editingStudent, setEditingStudent] = useState(null)
  const [editingResult, setEditingResult] = useState(null)
  const [transferringStudent, setTransferringStudent] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [showAuditModal, setShowAuditModal] = useState(false)

  // Ma'lumotlarni yuklash
  useEffect(() => {
    // O'quvchilar ma'lumotlarini yuklash
    const unsubscribeResults = onSnapshot(collection(db, "results"), (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(resultList)
      setFilteredStudents(resultList)
    })

    // Guruhlar ma'lumotlarini yuklash
    const unsubscribeGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setGroups(groupList)
    })

    // Audit loglarni yuklash
    const unsubscribeAudit = onSnapshot(collection(db, "audit_logs"), (snapshot) => {
      const logList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAuditLogs(logList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    })

    return () => {
      unsubscribeResults()
      unsubscribeGroups()
      unsubscribeAudit()
    }
  }, [])

  // Filtrlash
  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesSearch = `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGroup = selectedGroup === "all" || student.group_id === selectedGroup
      return matchesSearch && matchesGroup
    })
    setFilteredStudents(filtered)
  }, [students, searchTerm, selectedGroup])

  // Audit log qo'shish
  const addAuditLog = async (action, studentId, studentName, details) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        action,
        studentId,
        studentName,
        details,
        timestamp: new Date().toISOString(),
        adminUser: "Admin", // Bu yerda haqiqiy admin nomini qo'yish kerak
      })
    } catch (error) {
      console.error("Audit log qo'shishda xatolik:", error)
    }
  }

  // O'quvchi ma'lumotlarini tahrirlash
  const handleEditStudent = async (updatedData) => {
    try {
      const studentRef = doc(db, "results", editingStudent.id)
      await updateDoc(studentRef, {
        name: updatedData.name,
        surname: updatedData.surname,
        group: updatedData.group,
        group_id: updatedData.group_id,
      })

      await addAuditLog(
        "STUDENT_UPDATED",
        editingStudent.id,
        `${updatedData.name} ${updatedData.surname}`,
        `Ism: ${editingStudent.name} → ${updatedData.name}, Familiya: ${editingStudent.surname} → ${updatedData.surname}, Guruh: ${editingStudent.group} → ${updatedData.group}`,
      )

      setEditingStudent(null)
    } catch (error) {
      console.error("O'quvchi ma'lumotlarini yangilashda xatolik:", error)
    }
  }

  // Guruhni o'zgartirish
  const handleTransferStudent = async (newGroupId) => {
    try {
      const newGroup = groups.find((g) => g.id === newGroupId)
      const studentRef = doc(db, "results", transferringStudent.id)

      await updateDoc(studentRef, {
        group: newGroup.name,
        group_id: newGroupId,
      })

      await addAuditLog(
        "GROUP_TRANSFER",
        transferringStudent.id,
        `${transferringStudent.name} ${transferringStudent.surname}`,
        `Guruh o'zgartirildi: ${transferringStudent.group} → ${newGroup.name}`,
      )

      setTransferringStudent(null)
    } catch (error) {
      console.error("Guruhni o'zgartirishda xatolik:", error)
    }
  }

  // Test natijasini tahrirlash
  const handleEditResult = async (updatedResult) => {
    try {
      const studentRef = doc(db, "results", editingResult.id)
      await updateDoc(studentRef, {
        score: updatedResult.score,
        grade: updatedResult.grade,
        correctCount: updatedResult.correctCount,
        incorrectCount: updatedResult.incorrectCount,
        answers: updatedResult.answers, // Javoblar arrayini ham yangilaymiz
      })

      await addAuditLog(
        "RESULT_UPDATED",
        editingResult.id,
        `${editingResult.name} ${editingResult.surname}`,
        `Ball: ${editingResult.score} → ${updatedResult.score}, Baho: ${editingResult.grade} → ${updatedResult.grade}, To'g'ri javoblar: ${editingResult.correctCount} → ${updatedResult.correctCount}`,
      )

      setEditingResult(null)
    } catch (error) {
      console.error("Test natijalarini yangilashda xatolik:", error)
    }
  }

  // O'quvchini o'chirish
  const handleDeleteStudent = async (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId)
      await deleteDoc(doc(db, "results", studentId))

      await addAuditLog(
        "STUDENT_DELETED",
        studentId,
        `${student.name} ${student.surname}`,
        `O'quvchi va uning barcha natijalari o'chirildi`,
      )

      setShowDeleteConfirm(null)
    } catch (error) {
      console.error("O'quvchini o'chirishda xatolik:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">O'quvchilar boshqaruvi</h1>
                <p className="text-gray-500">O'quvchi ma'lumotlari va test natijalarini boshqaring</p>
              </div>
            </div>
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>O'zgarishlar tarixi</span>
            </button>
            <Link to='/admin'>Qaytish</Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ism yoki familiya bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                    {student.surname.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {student.name} {student.surname}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {student.group}
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Ball: {student.score}/{student.totalQuestions}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.grade === 5
                            ? "bg-green-100 text-green-800"
                            : student.grade === 4
                              ? "bg-blue-100 text-blue-800"
                              : student.grade === 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        Baho: {student.grade}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ma'lumotlarni tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTransferringStudent(student)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Guruhni o'zgartirish"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingResult(student)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Natijalarni tahrirlash"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(student)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Student Modal */}
        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            groups={groups}
            onSave={handleEditStudent}
            onClose={() => setEditingStudent(null)}
          />
        )}

        {/* Transfer Student Modal */}
        {transferringStudent && (
          <TransferStudentModal
            student={transferringStudent}
            groups={groups}
            onTransfer={handleTransferStudent}
            onClose={() => setTransferringStudent(null)}
          />
        )}

        {/* Edit Result Modal */}
        {editingResult && (
          <EditResultModal result={editingResult} onSave={handleEditResult} onClose={() => setEditingResult(null)} />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            student={showDeleteConfirm}
            onConfirm={() => handleDeleteStudent(showDeleteConfirm.id)}
            onClose={() => setShowDeleteConfirm(null)}
          />
        )}

        {/* Audit Log Modal */}
        {showAuditModal && <AuditLogModal logs={auditLogs} onClose={() => setShowAuditModal(false)} />}
      </div>
    </div>
  )
}

// O'quvchi ma'lumotlarini tahrirlash modali
function EditStudentModal({ student, groups, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: student.name,
    surname: student.surname,
    group: student.group,
    group_id: student.group_id,
  })

  const handleGroupChange = (groupId) => {
    const selectedGroup = groups.find((g) => g.id === groupId)
    setFormData({
      ...formData,
      group_id: groupId,
      group: selectedGroup ? selectedGroup.name : "",
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">O'quvchi ma'lumotlarini tahrirlash</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guruh</label>
            <select
              value={formData.group_id}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}

// Guruhni o'zgartirish modali
function TransferStudentModal({ student, groups, onTransfer, onClose }) {
  const [selectedGroupId, setSelectedGroupId] = useState("")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Guruhni o'zgartirish</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <strong>
              {student.name} {student.surname}
            </strong>{" "}
            ni qaysi guruhga ko'chirmoqchisiz?
          </p>
          <p className="text-sm text-gray-500">
            Joriy guruh: <strong>{student.group}</strong>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Yangi guruh</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Guruhni tanlang</option>
            {groups
              .filter((g) => g.id !== student.group_id)
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onTransfer(selectedGroupId)}
            disabled={!selectedGroupId}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Ko'chirish</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}

// Test natijalarini tahrirlash modali - kengaytirilgan versiya
function EditResultModal({ result, onSave, onClose }) {
  const [answers, setAnswers] = useState(result.answers || [])
  const [formData, setFormData] = useState({
    score: result.score,
    grade: result.grade,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
  })

  // Javoblar o'zgarganda natijalarni qayta hisoblash
  useEffect(() => {
    const correctCount = answers.filter((answer) => answer.isCorrect).length
    const incorrectCount = answers.length - correctCount
    const newGrade = calculateGrade(correctCount, answers.length)

    setFormData({
      score: correctCount,
      grade: newGrade,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
    })
  }, [answers])

  const calculateGrade = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100
    if (percentage >= 85) return 5
    if (percentage >= 71) return 4
    if (percentage >= 56) return 3
    return 2
  }

  // Javobni to'g'ri/noto'g'ri qilib o'zgartirish
  const toggleAnswer = (index) => {
    const updatedAnswers = [...answers]
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      isCorrect: !updatedAnswers[index].isCorrect,
    }
    setAnswers(updatedAnswers)
  }

  // Barcha javoblarni to'g'ri qilish
  const markAllCorrect = () => {
    const updatedAnswers = answers.map((answer) => ({
      ...answer,
      isCorrect: true,
    }))
    setAnswers(updatedAnswers)
  }

  // Barcha javoblarni noto'g'ri qilish
  const markAllIncorrect = () => {
    const updatedAnswers = answers.map((answer) => ({
      ...answer,
      isCorrect: false,
    }))
    setAnswers(updatedAnswers)
  }

  // Saqlash
  const handleSave = () => {
    const updatedResult = {
      ...formData,
      answers: answers,
    }
    onSave(updatedResult)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-auto overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Test natijalarini tahrirlash</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <strong>
              {result.name} {result.surname}
            </strong>
          </p>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-600 font-medium">Jami savollar</p>
              <p className="text-2xl font-bold text-blue-700">{answers.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 font-medium">To'g'ri javoblar</p>
              <p className="text-2xl font-bold text-green-700">{formData.correctCount}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-600 font-medium">Noto'g'ri javoblar</p>
              <p className="text-2xl font-bold text-red-700">{formData.incorrectCount}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-purple-600 font-medium">Baho</p>
              <p className="text-2xl font-bold text-purple-700">{formData.grade}</p>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex space-x-3 mb-4">
          <button
            onClick={markAllCorrect}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Barchasini to'g'ri</span>
          </button>
          <button
            onClick={markAllIncorrect}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>Barchasini noto'g'ri</span>
          </button>
        </div>

        {/* Javoblar ro'yxati */}
        <div className="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-lg">
          <div className="grid gap-2 p-4">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {answer.question?.length > 100 ? `${answer.question.substring(0, 100)}...` : answer.question}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>
                          Tanlangan: <strong>{answer.selectedAnswer}</strong>
                        </span>
                        <span>
                          To'g'ri javob: <strong>{answer.correctAnswer}</strong>
                        </span>
                        {answer.section && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{answer.section}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {answer.isCorrect ? "To'g'ri" : "Noto'g'ri"}
                  </div>

                  <button
                    onClick={() => toggleAnswer(index)}
                    className={`w-10 h-6 rounded-full transition-all duration-200 ${
                      answer.isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        answer.isCorrect ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 font-medium">Diqqat!</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Har bir javobni to'g'ri yoki noto'g'ri deb belgilashingiz mumkin. Natijalar avtomatik ravishda qayta
            hisoblanadi.
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}

// O'chirish tasdiqlash modali
function DeleteConfirmModal({ student, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-600">O'chirishni tasdiqlang</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {student.name} {student.surname}
              </p>
              <p className="text-sm text-gray-500">{student.group}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Bu amal qaytarib bo'lmaydi!</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• O'quvchining barcha ma'lumotlari o'chiriladi</li>
              <li>• Test natijalari butunlay yo'qoladi</li>
              <li>• Bu amal audit logda saqlanadi</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ha, o'chirish</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}

// Audit log modali
function AuditLogModal({ logs, onClose }) {
  const getActionIcon = (action) => {
    switch (action) {
      case "STUDENT_UPDATED":
        return <Edit3 className="w-4 h-4 text-blue-600" />
      case "GROUP_TRANSFER":
        return <ArrowRight className="w-4 h-4 text-green-600" />
      case "RESULT_UPDATED":
        return <BookOpen className="w-4 h-4 text-purple-600" />
      case "STUDENT_DELETED":
        return <Trash2 className="w-4 h-4 text-red-600" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionText = (action) => {
    switch (action) {
      case "STUDENT_UPDATED":
        return "Ma'lumot yangilandi"
      case "GROUP_TRANSFER":
        return "Guruh o'zgartirildi"
      case "RESULT_UPDATED":
        return "Natija tahrirlandi"
      case "STUDENT_DELETED":
        return "O'quvchi o'chirildi"
      default:
        return "Noma'lum amal"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">O'zgarishlar tarixi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800">{getActionText(log.action)}</h4>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString("uz-UZ")}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>O'quvchi:</strong> {log.studentName}
                    </p>
                    <p className="text-sm text-gray-500">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>Admin:</strong> {log.adminUser}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  )
}
