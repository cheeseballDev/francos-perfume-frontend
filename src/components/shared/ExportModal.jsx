import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, FileCode2 } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  if (!isOpen) return null;

  const handleExportClick = () => {
    if (!selectedFormat) {
      alert("Please select an export format (PDF, EXCEL, or CSV)");
      return;
    }
    // Pass the selected data back to the parent component
    onExport({ format: selectedFormat, dateFrom, dateTo });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-montserrat">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] p-8 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors p-1"
        >
          <X size={24} />
        </button>

        {/* TITLE */}
        <h2 className="text-3xl font-extrabold text-center text-[#333] mb-8 tracking-tight">
          Export To:
        </h2>

        {/* FORMAT SELECTION */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* PDF OPTION */}
          <button 
            onClick={() => setSelectedFormat('PDF')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              selectedFormat === 'PDF' 
                ? 'border-[#D4C4B0] bg-[#F7F7F9]' 
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <FileText size={64} className="text-[#333] mb-2" strokeWidth={1.5} />
            <span className="font-bold text-[#333] text-lg">PDF</span>
          </button>

          {/* EXCEL OPTION */}
          <button 
            onClick={() => setSelectedFormat('EXCEL')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              selectedFormat === 'EXCEL' 
                ? 'border-[#D4C4B0] bg-[#F7F7F9]' 
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet size={64} className="text-[#333] mb-2" strokeWidth={1.5} />
            <span className="font-bold text-[#333] text-lg">EXCEL</span>
          </button>

          {/* CSV OPTION */}
          <button 
            onClick={() => setSelectedFormat('CSV')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              selectedFormat === 'CSV' 
                ? 'border-[#D4C4B0] bg-[#F7F7F9]' 
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <FileCode2 size={64} className="text-[#333] mb-2" strokeWidth={1.5} />
            <span className="font-bold text-[#333] text-lg">CSV</span>
          </button>
        </div>

        {/* DATE SELECTION (OPTIONAL) */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-3">Select a date (optional):</p>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-400">Date From:</span>
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-gray-500" 
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-400">Date To:</span>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-gray-500" 
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-center">
          <button 
            onClick={handleExportClick}
            className="bg-[#E5D5C1] hover:bg-[#d4c2ab] text-[#333] px-8 py-3 rounded-md text-sm font-semibold transition-colors shadow-sm w-max"
          >
            Continue to export
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportModal;