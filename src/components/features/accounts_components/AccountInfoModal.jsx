import React, { useState } from 'react';

const AccountInfoModal = ({ isOpen, onClose, account, onEditClick }) => {
  // State for nested confirmation modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // If the main modal isn't open, or there's no account, render nothing
  if (!isOpen || !account) {
    // Also reset nested states if the main modal closes unexpectedly
    if (showResetConfirm) setShowResetConfirm(false);
    if (showDeactivateConfirm) setShowDeactivateConfirm(false);
    return null;
  }

  // Handlers for the nested modals
  const handleResetConfirm = () => {
    console.log("Password reset confirmed for:", account.email);
    // Add API call here
    setShowResetConfirm(false);
  };

  const handleDeactivateConfirm = () => {
    console.log("Account deactivated for:", account.email);
    // Add API call here
    setShowDeactivateConfirm(false);
  };

  // --- UI FOR NESTED CONFIRMATION MODALS ---
  
  // 1. Reset Password Confirmation
  if (showResetConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 font-montserrat">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
          <button 
            onClick={() => setShowResetConfirm(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
          
          <div className="p-8 text-center mt-4">
            <h3 className="text-2xl font-bold text-[#333] mb-4">
              Are you sure you want to reset the password for this account?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              The owner of the account will be notified and sent an email for the one-time generated password
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleResetConfirm}
                className="bg-[#E5D5C1] hover:bg-[#d4c2ab] text-[#333] font-bold py-3 px-12 rounded-md transition-colors w-32"
              >
                YES
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="border-2 border-[#D47B7B] text-[#D47B7B] hover:bg-red-50 font-bold py-3 px-12 rounded-md transition-colors w-32"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Deactivate Account Confirmation
  if (showDeactivateConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 font-montserrat">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
          <button 
            onClick={() => setShowDeactivateConfirm(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
          
          <div className="p-8 text-center mt-4">
            <h3 className="text-2xl font-bold text-[#333] mb-8">
              Are you sure you want to disable this account?
            </h3>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleDeactivateConfirm}
                className="bg-[#E5D5C1] hover:bg-[#d4c2ab] text-[#333] font-bold py-3 px-12 rounded-md transition-colors w-32"
              >
                YES
              </button>
              <button 
                onClick={() => setShowDeactivateConfirm(false)}
                className="border-2 border-[#D47B7B] text-[#D47B7B] hover:bg-red-50 font-bold py-3 px-12 rounded-md transition-colors w-32"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ACCOUNT INFO MODAL UI ---
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl leading-none">‹</span>
          </button>
          <h2 className="text-2xl font-bold text-[#333]">Account Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">First name:</p>
              <p className="font-bold text-[#333] text-lg">{account.name.split(' ')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Middle name:</p>
              <p className="font-bold text-[#333] text-lg">Joever</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Last name:</p>
              <p className="font-bold text-[#333] text-lg">{account.name.split(' ').slice(1).join(' ')}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-1">Address:</p>
            <p className="font-bold text-[#333] text-lg uppercase">67 BLK 420 STREET 69 FLOOR</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Email:</p>
              <p className="font-bold text-[#333] text-lg">{account.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Contact no.:</p>
              <p className="font-bold text-[#333] text-lg">4206967211738</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">Branch:</p>
              <p className="font-bold text-[#333] text-lg">{account.branch}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Role:</p>
              <p className="font-bold text-[#333] text-lg uppercase">{account.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { onClose(); onEditClick(); }}
              className="bg-[#E5D5C1] hover:bg-[#d4c2ab] text-[#333] py-2.5 rounded-md font-medium transition-colors"
            >
              Edit Account
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="border border-[#D47B7B] text-[#D47B7B] hover:bg-red-50 py-2.5 rounded-md font-medium transition-colors"
            >
              Reset Password
            </button>
            <button 
              onClick={() => setShowDeactivateConfirm(true)}
              className="border border-[#D47B7B] text-[#D47B7B] hover:bg-red-50 py-2.5 rounded-md font-medium transition-colors"
            >
              Deactivate Account
            </button>
            <button className="border border-[#D47B7B] text-[#D47B7B] hover:bg-red-50 py-2.5 rounded-md font-medium transition-colors">
              Archive Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoModal;