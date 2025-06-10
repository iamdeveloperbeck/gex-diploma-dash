

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"


export default function MultiSelect({
  options,
  placeholder = "Tanlang...",
  onChange,
  defaultSelected = [],
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState(defaultSelected)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Tashqi click bo'lganda dropdown ni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Dropdown ochilganda search input ga focus berish
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  if (!options) return <div>Malumot yo'q</div>

  // Filtrlangan optionlar
  const filteredOptions = options
//   const filteredOptions = options?.filter((option) => searchTerm ? option.label?.toLowerCase().includes(searchTerm?.toLowerCase()) : option)

  // Option tanlash/bekor qilish
  const toggleOption = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]

    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  // Bitta optionni olib tashlash
  const removeOption = (value, e) => {
    e.stopPropagation()
    const newSelectedValues = selectedValues.filter((v) => v !== value)
    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  // Barcha tanlovlarni tozalash
  const clearAll = (e) => {
    e.stopPropagation()
    setSelectedValues([])
    onChange?.([])
  }

  // Tanlangan optionlarning labellarini olish
  const getSelectedLabels = () => {
    return selectedValues.map((value) => options.find((option) => option.id === value)?.name || value)
  }

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Main Select Button */}
      <div
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[50px] max-h-[120px] overflow-x-hidden overflow-y-auto">
          {selectedValues.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            getSelectedLabels().map((label, index) => (
              <span
                key={selectedValues[index]}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {label}
                <button
                  onClick={(e) => removeOption(selectedValues[index], e)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {selectedValues.length > 0 && (
            <button onClick={clearAll} className="text-gray-400 hover:text-gray-600 p-1" title="Barchasini tozalash">
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Hech narsa topilmadi</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.id)
                return (
                  <div
                    key={option.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                      isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div
                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{option.name}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
