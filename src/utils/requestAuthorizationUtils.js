export const canUserApproveRequest = (user, request) => {
    if (!user || !request) return false;

    

    const { approvals = [], requestStatus, fromBranchId, toBranchId } = request;
    const userRole = user.activeRole || user.role;
    const userBranchId = Number(user.branchId);

    if (["APPROVED", "REJECTED", "CANCELLED", "COMPLETED", "RECEIVED"].includes(requestStatus)) {
        return false;
    }

    const currentPendingApproval = (approvals).find((a) => a.status === "PENDING");
    if (!currentPendingApproval) return false;

    const currentStage = currentPendingApproval.stage;

    if (currentStage === "SOURCE BRANCH MANAGER") {
        return (
            (userRole.includes("MANAGER")) && userBranchId === Number(fromBranchId)
        );
    }
    if (currentStage === "DESTINATION BRANCH MANAGER") {
        return (
            (userRole.includes("MANAGER")) && userBranchId === Number(toBranchId)
        );
    }

    if (currentStage === "OWNER") {
        return userRole === "OWNER";
    }

    return false;
};

export const getCurrentRequestStage = (request) => {
    if (!request?.approvals) return request?.requestStatus || "N/A";

    const currentPending = request.approvals.find((a) => a.status === "PENDING");
    if (currentPending) return currentPending.stage;

    const lastApproval = request.approvals[request.approvals.length - 1];
    return lastApproval ? lastApproval.stage : request.requestStatus;
};