import { useState, useEffect } from "react";
import { db } from "../data/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  Plus,
  Users,
  BookOpen,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
  BarChart3,
  Calendar,
  ClipboardList,
  CircleFadingPlus,
  FileDown,
} from "lucide-react";
import MultiSelect from "./ui/MultiSelect";

export default function AdminDashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [selectedFruits, setSelectedFruits] = useState([]);
  const [sections, setSections] = useState([]);

  const handleAddGroup = async () => {
    if (!newGroup.trim()) return;

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: newGroup.trim(),
        subjects: selectedFruits
      });

      setGroups([...groups, { id: docRef.id, name: newGroup.trim(), subjects: selectedFruits }]);
      setNewGroup("");

      showAlert("Guruh muvaffaqiyatli qo'shildi.", "success");
    } catch (error) {
      showAlert(
        "Guruh qo'shib bo'lmadi. Iltimos, qayta urinib koʻring.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sections"));
      const sectionList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSections(sectionList);
    } catch (error) {
      console.error("Qismlarni yuklashda xatolik:", error);
      showAlert("Qismlarni yuklashda xatolik yuz berdi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const groupSnapshot = await getDocs(collection(db, "groups"));
      const groupList = groupSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
    } catch (error) {
      showAlert("Failed to fetch groups. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchSections();
  }, []);

  console.log(sections);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin boshqaruv paneli
                </h1>
                <p className="text-gray-500">
                  Guruhlar va testlarni boshqaring
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/addquiz"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FileDown className="w-5 h-5" />
                <span>Savol qo'shish</span>
              </Link>
              <Link
                to="/addsection"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <CircleFadingPlus className="w-5 h-5" />
                <span>Fanlar qo'shish</span>
              </Link>
              <Link
                to="/viewtest"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ClipboardList className="w-5 h-5" />
                <span>Bo'limlangan testlar</span>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Jami guruhlar
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {groups.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Faol guruhlar
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {groups.length}
                  </p>
                </div>
                <GraduationCap className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Bugungi testlar
                  </p>
                  <p className="text-3xl font-bold text-purple-700">0</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-500" />
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
              {alert.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Group Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Guruh qo'shish
                </h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddGroup();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="groupName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Yangi guruh nomi
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Masalan: Statsionar 18-guruh"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fanni tanlang:
                  </label>
                  <MultiSelect
                    options={sections}
                    placeholder="Fanlarni tanlang..."
                    onChange={setSelectedFruits}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !newGroup.trim()}
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
                      <span>Guruh qo'shish</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Groups List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Guruhlar
                </h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <Users className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-4 text-gray-500 font-medium">
                    Guruhlar yuklanmoqda...
                  </p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Hech qanday guruh mavjud emas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Birinchi guruhingizni qo'shish uchun chap tomondagi formadan
                    foydalaning.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {groups.map((group, index) => (
                    <div
                      key={group.id}
                      className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition-all duration-300 border border-gray-200 hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {group.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Yaratilgan
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                Guruh
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={group.id}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors group-hover:scale-105 transform duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Tafsilotlarni ko'rish</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
