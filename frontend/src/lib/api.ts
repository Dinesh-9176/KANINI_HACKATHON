/**
 * API service for dashboard data integration.
 * Connects to the FastAPI backend.
 */

const API_BASE_URL = "http://localhost:8000/api";

interface KPIData {
    total_patients: number;
    high_risk: number;
    avg_wait: number;
    department_load: number;
}

interface RiskDistribution {
    name: string;
    value: number;
    color: string;
}

interface DepartmentLoad {
    name: string;
    patients: number;
}

interface Alert {
    id: string;
    message: string;
    type: "critical" | "warning" | "info";
    time: string;
}

export const fetchDashboardStats = async (): Promise<KPIData> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        // Fallback or re-throw
        return { total_patients: 0, high_risk: 0, avg_wait: 0, department_load: 0 };
    }
}

export const fetchRiskDistribution = async (): Promise<RiskDistribution[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/risks`);
        if (!response.ok) throw new Error("Failed to fetch risk data");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}

export const fetchDepartmentLoad = async (): Promise<DepartmentLoad[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/departments`);
        if (!response.ok) throw new Error("Failed to fetch department data");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}

export const fetchAlerts = async (): Promise<Alert[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/alerts`);
        if (!response.ok) throw new Error("Failed to fetch alerts");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}
