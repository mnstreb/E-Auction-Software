// js/ui-elements.js

// UI Element references
const uiElements = {
    setupWizard: document.getElementById('setupWizard'),
    mainApp: document.getElementById('mainApp'),
    wizardSteps: [
        document.getElementById('wizardStep1'),
        document.getElementById('wizardStep2'),
        document.getElementById('wizardStep3')
    ],
    stepIndicators: [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3')
    ],
    estimateTableBody: document.getElementById('estimateTableBody'),
    dynamicLaborRateInputs: document.getElementById('dynamicLaborRateInputs'),
    advancedLink: document.getElementById('advancedLink'),
    advancedSkillLevelControls: document.getElementById('advancedSkillLevelControls'),

    showAdvancedDetailsLink: document.getElementById('showAdvancedDetailsLink'),
    advancedDetailsSection: document.getElementById('advancedDetailsSection'),

    tradeSearchInput: document.getElementById('tradeSearchInput'),

    logoUploadInput: document.getElementById('logoUploadInput'),
    logoUploadArea: document.getElementById('logoUploadArea'),
    wizardLogoPreview: document.getElementById('wizardLogoPreview'),
    defaultLogoIcon: document.getElementById('defaultLogoIcon'),
    uploadText: document.getElementById('uploadText'),

    mainAppLogo: document.getElementById('mainAppLogo'),

    // Top-level summary elements
    summaryTotalProposalElem: document.getElementById('summaryTotalProposal'),
    summaryOverallLaborHoursElem: document.getElementById('summaryOverallLaborHours'),

    // Executive Summary elements
    summaryProjectCost: document.getElementById('summaryProjectCost'),
    summaryMiscCost: document.getElementById('summaryMiscCost'),
    summaryMarkup: document.getElementById('summaryMarkup'),
    summaryEstimateSubtotal: document.getElementById('summaryEstimateSubtotal'),
    summaryProfitMargin: document.getElementById('summaryProfitMargin'),
    summarySalesTax: document.getElementById('summarySalesTax'),
    summaryMiscPercent: document.getElementById('summaryMiscPercent'),
    summaryOverhead: document.getElementById('summaryOverhead'),
    summaryAdditionalConsiderations: document.getElementById('summaryAdditionalConsiderations'),

    // Labor Breakdown (hours) elements
    laborPMTotal: document.getElementById('laborPMTotal'),
    laborSuperintendentTotal: document.getElementById('laborSuperintendentTotal'),
    laborGeneralForemanTotal: document.getElementById('laborGeneralForemanTotal'),
    laborForemanTotal: document.getElementById('laborForemanTotal'),
    laborJourneymanTotal: document.getElementById('laborJourneymanTotal'),
    laborApprenticeTotal: document.getElementById('laborApprenticeTotal'),

    // Project Cost Breakdown elements
    breakdownLaborTotal: document.getElementById('breakdownLaborTotal'),
    breakdownMaterialTotal: document.getElementById('breakdownMaterialTotal'),
    breakdownTravelTotal: document.getElementById('breakdownTravelTotal'),
    breakdownEquipmentTotal: document.getElementById('breakdownEquipmentTotal'),
    breakdownFixedTotal: document.getElementById('breakdownFixedTotal'),
    breakdownSubcontractorTotal: document.getElementById('breakdownSubcontractorTotal'),
    breakdownAllowanceTotal: document.getElementById('breakdownAllowanceTotal'),
    breakdownOtherTotal: document.getElementById('breakdownOtherTotal'),

    projectInfoElem: document.getElementById('projectInfo'),
    laborMaterialPieChartCanvas: document.getElementById('laborMaterialPieChart'),
    laborMaterialPieChart: null, // Will hold the Chart.js instance
    
    // Trade multi-select elements
    tradesDropdown: document.getElementById('tradesDropdown'),
    selectedTradesDisplay: document.getElementById('selectedTradesDisplay')
};
