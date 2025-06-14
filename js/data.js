// js/data.js

// Global variables for project settings
let projectSettings = {
    projectName: "Commercial Construction Project",
    clientName: "",
    projectAddress: "",
    projectCity: "",
    projectZip: "",
    startDate: "",
    endDate: "",
    projectID: "",
    projectDescription: "",
    contractorLogo: "",
    projectType: "Commercial",
    projectState: "CA",
    profitMargin: 0,
    salesTax: 0,
    miscellaneous: 0,
    overhead: 0,
    additionalConsiderationsType: '%',
    additionalConsiderationsValue: 0,
    // Define labor rates nested by trade
    allTradeLaborRates: {
        "General": {
            "Project Manager": 120,
            "Superintendent": 100,
            "General Foreman": 90,
            "Foreman": 85,
            "Journeyman": 75,
            "Apprentice": 50
        },
        "Electrical": {
            "Project Manager": 135,
            "Superintendent": 110,
            "General Foreman": 100,
            "Foreman": 95,
            "Journeyman": 80,
            "Apprentice": 55
        },
        "Plumbing": {
            "Project Manager": 125,
            "Superintendent": 105,
            "General Foreman": 95,
            "Foreman": 90,
            "Journeyman": 78,
            "Apprentice": 52
        },
        "HVAC": {
            "Project Manager": 130,
            "Superintendent": 108,
            "General Foreman": 98,
            "Foreman": 92,
            "Journeyman": 77,
            "Apprentice": 53
        },
        "Carpentry": {
            "Project Manager": 115,
            "Superintendent": 95,
            "General Foreman": 85,
            "Foreman": 80,
            "Journeyman": 70,
            "Apprentice": 48
        },
        "Concrete": { "Project Manager": 110, "Superintendent": 90, "General Foreman": 80, "Foreman": 75, "Journeyman": 68, "Apprentice": 45 },
        "Roofing": { "Project Manager": 120, "Superintendent": 98, "General Foreman": 88, "Foreman": 83, "Journeyman": 73, "Apprentice": 47 },
        "Painting": { "Project Manager": 105, "Superintendent": 88, "General Foreman": 78, "Foreman": 73, "Journeyman": 65, "Apprentice": 42 },
        "Drywall": { "Project Manager": 112, "Superintendent": 92, "General Foreman": 82, "Foreman": 77, "Journeyman": 69, "Apprentice": 44 },
        "Masonry": { "Project Manager": 128, "Superintendent": 102, "General Foreman": 93, "Foreman": 88, "Journeyman": 76, "Apprentice": 51 },
        "Landscaping": { "Project Manager": 100, "Superintendent": 85, "General Foreman": 75, "Foreman": 70, "Journeyman": 60, "Apprentice": 40 }
    },
    activeTrades: ["General"],
    travelCost: 0,
    equipmentCost: 0,
    fixedCost: 0,
    subcontractorCost: 0,
    allowanceCost: 0
};

// Estimate data structure
let estimateItems = [
    {
        id: Date.now() + 1,
        taskName: 'GENERAL REQUIREMENTS',
        description: 'Plans, specifications, engineering, permits, zoning, building, environmental, and survey',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 2,
        taskName: 'Plans and Specifications',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 3,
        taskName: 'Plan Review',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 4,
        taskName: 'Permits: Zoning, Building, Environmental, Other',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 5,
        taskName: 'Survey',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 6,
        taskName: 'Impact Fee',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 7,
        taskName: 'Administrative Costs',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 8,
        taskName: 'Financing Costs',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 9,
        taskName: 'Legal Fees',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 10,
        taskName: 'Engineering Fees',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    },
    {
        id: Date.now() + 11,
        taskName: 'Insurance',
        description: '',
        trade: 'General',
        rateRole: 'Journeyman',
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    }
];

// Helper function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Helper function for hours formatting (2 decimal places)
function formatHours(hours) {
    return parseFloat(hours).toFixed(2);
}

const stateSalesTax = {
    'CA': 8.25, 'TX': 6.25, 'NY': 4.0, 'FL': 6.0, 'WA': 6.5, 'IL': 6.25,
    'AL': 4.0, 'AK': 0.0, 'AZ': 5.6, 'AR': 6.5, 'CO': 2.9, 'CT': 6.35, 'DE': 0.0,
    'GA': 4.0, 'HI': 4.0, 'ID': 6.0, 'IN': 7.0, 'IA': 6.0, 'KS': 6.5, 'KY': 6.0,
    'LA': 4.45, 'ME': 5.5, 'MD': 6.0, 'MA': 6.25, 'MI': 6.0, 'MN': 6.875, 'MS': 7.0,
    'MO': 4.225, 'MT': 0.0, 'NE': 5.5, 'NV': 6.85, 'NH': 0.0, 'NJ': 6.625, 'NM': 5.125,
    'NC': 4.75, 'ND': 5.0, 'OH': 5.75, 'OK': 4.5, 'OR': 0.0, 'PA': 6.0, 'RI': 7.0,
    'SC': 6.0, 'SD': 4.5, 'TN': 7.0, 'UT': 4.85, 'VT': 6.0, 'VA': 5.3, 'WV': 6.0,
    'WI': 5.0, 'WY': 4.0
};
