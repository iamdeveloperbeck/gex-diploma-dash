import React, { useState, useEffect } from "react";
import { db } from "../data/firebase"; // Firebase konfiguratsiya faylingiz
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const TestList = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedTests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isEditing: false,
          newQuestion: "",
          newOptions: [],
          newCorrectAnswer: "",
        }));
        setTests(fetchedTests);
      } catch (error) {
        console.error("Testlarni yuklashda xatolik:", error);
      }
    };

    fetchTests();
  }, []);

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
          : test
      )
    );
  };

  const saveEditTest = async (id) => {
    const testToEdit = tests.find((test) => test.id === id);
    if (
      !testToEdit ||
      !testToEdit.newQuestion ||
      !testToEdit.newOptions.length ||
      !testToEdit.newCorrectAnswer
    )
      return;

    try {
      const testRef = doc(db, "questions", id);
      await updateDoc(testRef, {
        question: testToEdit.newQuestion,
        options: testToEdit.newOptions,
        correctAnswer: testToEdit.newCorrectAnswer,
      });

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
            : test
        )
      );
      console("Test muvaffaqiyatli o'zgartirildi!");
    } catch (error) {
      console.error("Savolni o'zgartirishda xatolik:", error);
    }
  };

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
          : test
      )
    );
  };

  const handleOptionChange = (id, optionIndex, newValue) => {
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id
          ? {
              ...test,
              newOptions: test.newOptions.map((opt, idx) =>
                idx === optionIndex ? newValue : opt
              ),
            }
          : test
      )
    );
  };

  const handleCorrectAnswerChange = (id, newValue) => {
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id ? { ...test, newCorrectAnswer: newValue } : test
      )
    );
  };

  const handleDeleteTest = async (id) => {
    const confirmDelete = window.confirm("Bu testni o'chirishni istaysizmi?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "questions", id));
      setTests((prevTests) => prevTests.filter((test) => test.id !== id));
      alert("Test muvaffaqiyatli o'chirildi!");
    } catch (error) {
      console.error("Testni o'chirishda xatolik:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Testlar Ro'yxati</h1>
        <Link
          to="/addquiz"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Orqaga qaytish
        </Link>
      </div>
      <ul className="space-y-4">
        {tests.map((test) => (
          <li
            key={test.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col space-y-2">
              {test.isEditing ? (
                <>
                  <input
                    type="text"
                    value={test.newQuestion}
                    onChange={(e) =>
                      setTests((prevTests) =>
                        prevTests.map((t) =>
                          t.id === test.id
                            ? { ...t, newQuestion: e.target.value }
                            : t
                        )
                      )
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  {test.newOptions.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(test.id, index, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full mt-1"
                    />
                  ))}
                  <input
                    type="text"
                    value={test.newCorrectAnswer}
                    onChange={(e) =>
                      handleCorrectAnswerChange(test.id, e.target.value)
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full mt-2"
                    placeholder="To'g'ri javobni kiriting"
                  />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-700">
                    {test.question}
                  </h3>
                  <p className="text-gray-600">
                    Javoblar: {test.options?.join(", ")}
                  </p>
                  <p className="text-gray-800 font-semibold">
                    To'g'ri Javob: {test.correctAnswer}
                  </p>
                </>
              )}
              <div className="space-x-2">
                {test.isEditing ? (
                  <>
                    <button
                      onClick={() => saveEditTest(test.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                    >
                      Saqlash
                    </button>
                    <button
                      onClick={() => cancelEditTest(test.id)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                      Bekor qilish
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditTest(test.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                    >
                      O'zgartirish
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    >
                      O'chirish
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestList;
