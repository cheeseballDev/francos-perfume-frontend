const API_URL = "http://localhost:5019/api"


export const fetchAllInventory = async (token) => {
    const response = await fetch(`${API_URL}/Inventory/displayAll`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
        }
    });
    if (!response.ok) throw new Error(await response.text());

    return await response.json();
}

export const updateStock = async (restockType) => {
    const response = await fetch(`${API_URL}/Inventory/updateStock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restockType })
    });

    if (!response.ok) throw new Error(await response.text());

    return await response.json();
}

