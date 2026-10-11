export const updateAccountDTO = (data, employeeId) => ({  
    id: employeeId,
    firstName: data.firstName.trim(),
    middleName: data.middleName.trim() || '',
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    contactNumber: data.contactNumber?.trim() || '',
    address: data.address?.trim() || '',
    employeeRole: data.employeeRole ,
})

