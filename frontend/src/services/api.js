import axios from 'axios';

const API_URL = 'https://fairshare-hrqf.onrender.com/';

export const createGroup = async (name, members) => {
    const response = await axios.post(`${API_URL}/create-group`, { name, members });
    return response.data;
};

export const getGroups = async () => {
    const response = await axios.get(`${API_URL}/groups`);
    return response.data;
};

export const getGroup = async (id) => {
    const response = await axios.get(`${API_URL}/group/${id}`);
    return response.data;
};

export const addMember = async (groupId, memberName) => {
    const response = await axios.post(`${API_URL}/add-member`, { group_id: groupId, member_name: memberName });
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await axios.post(`${API_URL}/add-expense`, expenseData);
    return response.data;
};

export const getGroupExpenses = async (groupId) => {
    const response = await axios.get(`${API_URL}/group/${groupId}/expenses`);
    return response.data;
};

export const getBalances = async (groupId) => {
    const response = await axios.get(`${API_URL}/balances/${groupId}`);
    return response.data;
};

export const settleDebt = async (settlementData) => {
    const response = await axios.post(`${API_URL}/settle`, settlementData);
    return response.data;
};
