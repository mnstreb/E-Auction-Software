<div class="top-summary-row">
    <!-- Overall Proposal Card -->
    <div class="summary-overall-metric-card">
        <div class="label">Total Proposal</div>
        <div class="value" id="summaryTotalProposal">$0.00</div>
    </div>
    
    <!-- Overall Labor Hours Card -->
    <div class="summary-overall-metric-card">
        <div class="label">Overall Labor Hours</div>
        <div class="value" id="summaryOverallLaborHours">0.00</div>
    </div>

    <!-- Cost Distribution Pie Chart Card -->
    <div class="chart-container card">
        <h4>Cost Distribution</h4>
        <canvas id="laborMaterialPieChart" class="chart-canvas"></canvas>
    </div>
</div>

<div class="executive-summary-grid-3col">
    <!-- Project Cost Summary -->
    <div class="card summary-block">
        <h4>Project Costs Summary</h4>
        <div class="summary-item">
            <span>Direct Costs:</span>
            <strong id="summaryProjectCost">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Material Markup (<span id="summaryMaterialMarkup">0.00</span>%):</span>
            <strong id="summaryMaterialMarkupAmount">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Overhead (<span id="summaryOverhead">0.00</span>%):</span>
            <strong id="summaryOverheadAmount">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Miscellaneous (<span id="summaryMiscPercent">0.00</span>%):</span>
            <strong id="summaryMiscCost">$0.00</strong>
        </div>
        <div class="summary-item total">
            <span>Estimate Subtotal:</span>
            <strong id="summaryEstimateSubtotal">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Profit Margin (<span id="summaryProfitMargin">0.00</span>%):</span>
            <strong id="summaryProfitMarginAmount">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Sales Tax (<span id="summarySalesTax">0.00</span>%):</span>
            <strong id="summarySalesTaxAmount">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Additional Considerations (<span id="summaryAdditionalConsiderationsUnit"></span>):</span>
            <strong id="summaryAdditionalConsiderations">$0.00</strong>
        </div>
        <div class="summary-item total">
            <span>TOTAL PROPOSAL:</span>
            <strong id="summaryTotalProposalFinal">$0.00</strong>
        </div>
    </div>

    <!-- Labor Breakdown Summary -->
    <div class="card summary-block">
        <h4>Labor Breakdown (Hours)</h4>
        <div class="summary-item">
            <span>Project Manager:</span>
            <strong id="laborPMTotal">0.00 hrs</strong>
        </div>
        <div class="summary-item">
            <span>Superintendent:</span>
            <strong id="laborSuperintendentTotal">0.00 hrs</strong>
        </div>
        <div class="summary-item">
            <span>General Foreman:</span>
            <strong id="laborGeneralForemanTotal">0.00 hrs</strong>
        </div>
        <div class="summary-item">
            <span>Foreman:</span>
            <strong id="laborForemanTotal">0.00 hrs</strong>
        </div>
        <div class="summary-item">
            <span>Journeyman:</span>
            <strong id="laborJourneymanTotal">0.00 hrs</strong>
        </div>
        <div class="summary-item">
            <span>Apprentice:</span>
            <strong id="laborApprenticeTotal">0.00 hrs</strong>
        </div>
        <!-- Add other labor roles dynamically if needed -->
        <div class="summary-item total">
            <span>TOTAL LABOR HOURS:</span>
            <strong id="breakdownLaborHoursTotal">0.00 hrs</strong>
        </div>
    </div>

    <!-- Detailed Cost Breakdown -->
    <div class="card summary-block">
        <h4>Detailed Cost Breakdown</h4>
        <div class="summary-item">
            <span>Total Labor Cost:</span>
            <strong id="breakdownLaborTotal">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Total Material Cost (Raw):</span>
            <strong id="breakdownMaterialTotal">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Total Equipment / Rental:</span>
            <strong id="breakdownEquipmentTotal">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Total Subcontractor:</span>
            <strong id="breakdownSubcontractorTotal">$0.00</strong>
        </div>
        <div class="summary-item">
            <span>Total Misc. Line Items:</span>
            <strong id="breakdownMiscCostLineItems">$0.00</strong>
        </div>
        <div class="summary-item total">
            <span>TOTAL PROJECT DIRECT COST:</span>
            <strong id="breakdownProjectTotal">$0.00</strong>
        </div>
    </div>
</div>
