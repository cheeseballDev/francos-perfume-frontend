const API_URL = "http://localhost:5019/api"


export const fetchAllInventory = async (token) => {
    const response = await fetch(`${API_URL}/Inventory/displayAll`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
        }
    });
    //console.log("API Response:", response);
    if (!response.ok) throw new Error(await response.text());

    return await response.json();
}

export const updateStock = async () => {

}

