import { Patient, ContributingFactor } from './mockData';

// Mock contributing factors based on patient risk level
export const getContributingFactors = (patient: Patient): ContributingFactor[] => {
    if (patient.contributingFactors && patient.contributingFactors.length > 0) {
        return patient.contributingFactors;
    }

    if (patient.riskLevel === "high") {
        return [
            { name: "Heart Rate", value: `${patient.vitals.hr} bpm`, impact: 92, isPositive: false },
            { name: "Blood Pressure", value: patient.vitals.bp, impact: 85, isPositive: false },
            { name: "Reported Symptoms", value: "Severe", impact: 78, isPositive: false },
            { name: "Oxygen Saturation", value: `${patient.vitals.spo2}%`, impact: 65, isPositive: false },
            { name: "Age Factor", value: `${patient.age} years`, impact: 42, isPositive: true },
        ];
    } else if (patient.riskLevel === "medium") {
        return [
            { name: "Heart Rate", value: `${patient.vitals.hr} bpm`, impact: 55, isPositive: false },
            { name: "Temperature", value: `${patient.vitals.temp}°F`, impact: 48, isPositive: false },
            { name: "Reported Symptoms", value: "Moderate", impact: 35, isPositive: false },
            { name: "Blood Pressure", value: patient.vitals.bp, impact: 25, isPositive: true },
            { name: "SpO2", value: `${patient.vitals.spo2}%`, impact: 15, isPositive: true },
        ];
    } else {
        return [
            { name: "Blood Pressure", value: patient.vitals.bp, impact: 15, isPositive: true },
            { name: "Heart Rate", value: `${patient.vitals.hr} bpm`, impact: 12, isPositive: true },
            { name: "Temperature", value: `${patient.vitals.temp}°F`, impact: 8, isPositive: true },
            { name: "Oxygen Saturation", value: `${patient.vitals.spo2}%`, impact: 5, isPositive: true },
        ];
    }
};

export const allocateResources = (patient: Patient): { room: string, labs: string[] } => {
    // 1. Room Allocation Logic
    let room = "Waiting Room";

    if (patient.riskLevel === "high" || patient.priorityScore > 80) {
        if (patient.department === "Trauma" || patient.department === "Emergency") {
            room = "Trauma Bay (Auto-Assigned)";
        } else if (patient.vitals.spo2 < 90 || patient.vitals.bp.startsWith("8")) { // Low BP check loosely
            room = "ICU Bed (Critical)";
        } else {
            room = "Acute Care Unit";
        }
    } else if (patient.riskLevel === "medium") {
        room = `General Ward - ${patient.department}`;
    }

    // 2. Lab Allocation Logic based on symptoms/dept
    const labs: string[] = ["Basic Vitals Check"];
    const symptoms = patient.symptoms.map(s => s.toLowerCase());

    // Cardiac
    if (patient.department === "Cardiology" || symptoms.some(s => s.includes("chest") || s.includes("heart"))) {
        labs.push("ECG / EKG");
        labs.push("Troponin Test");
    }

    // Respiratory
    if (patient.department === "Pulmonology" || symptoms.some(s => s.includes("breath") || s.includes("cough"))) {
        labs.push("Chest X-Ray");
        labs.push("SpO2 Monitoring");
    }

    // Trauma / Ortho
    if (patient.department === "Trauma" || patient.department === "Orthopedics" || symptoms.some(s => s.includes("pain") && !s.includes("chest"))) {
        labs.push("X-Ray / CT Scan");
    }

    // Neurology
    if (patient.department === "Neurology" || symptoms.some(s => s.includes("dizzy") || s.includes("headache"))) {
        labs.push("CT Head / MRI");
    }

    // General high fever/infection
    if (patient.vitals.temp > 101 || symptoms.some(s => s.includes("fever"))) {
        labs.push("Complete Blood Count (CBC)");
        labs.push("Blood Culture");
    }

    return { room, labs };
};
