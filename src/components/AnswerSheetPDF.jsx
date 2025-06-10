import React, { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../data/firebase";
import html2pdf from "html2pdf.js";
import { useParams } from "react-router-dom";

const AnswerSheetPDF = () => {
  const { id } = useParams(); // result ID
  const [result, setResult] = useState(null);
  const sheetRef = useRef();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultDoc = await getDoc(doc(db, "results", id));
        if (resultDoc.exists()) {
          setResult(resultDoc.data());
        } else {
          console.error("Result not found");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      }
    };
    fetchResult();
  }, [id]);

  const downloadPDF = () => {
    const element = sheetRef.current;
    const opt = {
      margin: 0.3,
      filename: `${result.name}_${result.surname}_javoblar_varaqasi.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!result) return <p>Yuklanmoqda...</p>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end">
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Yuklab olish (PDF)
        </button>
      </div>

      <div
        ref={sheetRef}
        className="bg-white text-black p-6 w-[21cm] min-h-[29.7cm] mx-auto border border-gray-300"
      >
        <h1 className="text-xl font-bold text-center mb-2">
          JAVOBLAR VARAQASI
        </h1>
        <div className="mb-4 text-sm">
          <p>
            <strong>Ism:</strong> {result.name}
          </p>
          <p>
            <strong>Familiya:</strong> {result.surname}
          </p>
          <p>
            <strong>Guruh:</strong> {result.group}
          </p>
          <p>
            <strong>Sana:</strong> {new Date(result.date).toLocaleDateString()}
          </p>
          <p>
            <strong>To‘g‘ri javoblar:</strong> {result.score} /{" "}
            {result.totalQuestions}
          </p>
          <p>
            <strong>Bahosi:</strong> {result.grade}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {result.answers &&
            result.answers.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-12 font-medium">#{index + 1}</div>
                {["A", "B", "C", "D"].map((opt) => (
                  <div
                    key={opt}
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 text-xs font-bold ${
                      item.selectedAnswer === opt
                        ? "bg-black text-white"
                        : "border-gray-400 text-gray-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnswerSheetPDF;