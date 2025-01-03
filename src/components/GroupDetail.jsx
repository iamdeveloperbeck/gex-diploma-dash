import React, { useEffect, useState } from "react";
import { onSnapshot, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../data/firebase";

export default function GroupDetail() {
  const private_secret_key = "12345678"
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", score: "", grade: "", secret_key: "" });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "results"), (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newResult = resultList.filter((list) => list.group_id === id);
      setResults(newResult);
    });

    return () => unsubscribe();
  }, [id]);

  const handleEditClick = (result) => {
    setEditData({
      id: result.id,
      name: result.name,
      score: result.score,
      grade: result.grade,
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    try {
      if (editData.secret_key === private_secret_key) {
        const resultDoc = doc(db, "results", editData.id);
        await updateDoc(resultDoc, {
          name: editData.name,
          score: parseInt(editData.score, 10),
          grade: parseInt(editData.grade, 10),
        });
      }else {
        window.alert("Pashol naxxuy .... Parol noto'g'ri")
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Ma'lumotni yangilashda xatolik:", error);
    }
  };

  const handleDelete = async (resultId) => {
    try {
      const resultDoc = doc(db, "results", resultId);
      await deleteDoc(resultDoc);
    } catch (error) {
      console.error("Ma'lumotni o'chirishda xatolik:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Guruh bo'yicha o'quvchilar ma'lumoti
          </h1>
          <Link 
            to="/admin" 
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Orqaga qaytish
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {results.map((result) => (
              <div 
                key={result.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      {result.name} {result.surname}
                    </h2>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {result.grade}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {result.group}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditClick(result)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(result.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Hech qanday ma'lumot topilmadi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Ma'lumotni tahrirlash</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="border rounded-lg px-3 py-2"
                placeholder="Ism"
              />
              <input
                type="number"
                name="score"
                value={editData.score}
                onChange={handleEditChange}
                className="border rounded-lg px-3 py-2"
                placeholder="Baholar"
              />
              <input
                type="number"
                name="grade"
                value={editData.grade}
                onChange={handleEditChange}
                className="border rounded-lg px-3 py-2"
                placeholder="Yakuniy baho"
              />
              <input
                type="text"
                name="secret_key"
                onChange={handleEditChange}
                className="border rounded-lg px-3 py-2"
                placeholder="Secret_key"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
