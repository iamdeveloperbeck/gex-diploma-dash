import React, { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../data/firebase";

export default function GroupDetail() {
  const { id } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const results = onSnapshot(collection(db, "results"), (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newResult = resultList.filter((list) => list.group_id === id);
      setResults(newResult);
    });

    return () => results();
  }, [id]);

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
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      {result.name}
                    </h2>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {result.grade}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {result.group}
                  </p>
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
    </div>
  );
}