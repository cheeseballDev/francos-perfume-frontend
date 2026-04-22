import { createContext, useContext, useState } from 'react';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
    const [branchId, setBranchId] = useState(() => {
        return sessionStorage.getItem('branchId') || null;
    });

    const updateBranch = (id) => {
        if (id) {
            sessionStorage.setItem('branchId', id);
        } else {
            sessionStorage.removeItem('branchId');
        }
        setBranchId(id);
    }
    return (
        <BranchContext.Provider value={{ branchId, setBranchId }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => useContext(BranchContext);