// src/sections/SavedProjects/SavedProjects.js

window.SavedProjects = (function() {
    let savedProjectsContainer;
    let customerFilterInput;
    let projectsList;
    let goToCalculatorBtn;
    let customerProjectsPieChartCanvas;
    let noCustomerDataMessage;
    let noProjectsMessage;

    let onGoToCalculatorCallback; // Callback to return to main app

    let customerProjectsPieChart; // Chart.js instance for customer totals

    // Mock data for saved projects (will be replaced by Firestore later)
    let savedProjectsData = [
        {
            id: 'proj_001',
            projectName: 'Downtown Office Renovation',
            customerName: 'Acme Corp',
            projectType: 'Commercial',
            projectState: 'CA',
            totalProposal: 150000.00,
            lastSavedDate: '2025-06-28',
            status: 'Draft',
            // Store the full projectSettings and estimateItems if needed for loading
            // For now, these are just illustrative mock fields.
            // When we implement actual saving/loading, this object would contain
            // the stringified projectSettings and estimateItems.
            projectDetails: { /* ...full project data here... */ } 
        },
        {
            id: 'proj_002',
            projectName: 'Residential Kitchen Remodel',
            customerName: 'Jane Doe',
            projectType: 'Residential',
            projectState: 'TX',
            totalProposal: 75500.00,
            lastSavedDate: '2025-06-27',
            status: 'Pending Review',
            projectDetails: { /* ...full project data here... */ }
        },
        {
            id: 'proj_003',
            projectName: 'Industrial Warehouse Build',
            customerName: 'Global Logistics Inc.',
            projectType: 'Industrial',
            projectState: 'NY',
            totalProposal: 320000.00,
            lastSavedDate: '2025-06-25',
            status: 'Awarded',
            projectDetails: { /* ...full project data here... */ }
        },
        {
            id: 'proj_004',
            projectName: 'Retail Store Fit-out',
            customerName: 'Fashion Forward Boutiques',
            projectType: 'Commercial',
            projectState: 'FL',
            totalProposal: 98000.00,
            lastSavedDate: '2025-06-20',
            status: 'Rejected',
            projectDetails: { /* ...full project data here... */ }
        },
        {
            id: 'proj_005',
            projectName: 'Residential Bathroom Remodel',
            customerName: 'Jane Doe',
            projectType: 'Residential',
            projectState: 'CA',
            totalProposal: 42000.00,
            lastSavedDate: '2025-06-19',
            status: 'Draft',
            projectDetails: { /* ...full project data here... */ }
        }
    ];

    /**
     * Initializes the SavedProjects module.
     * @param {object} config - Configuration object.
     * @param {function} config.onGoToCalculator - Callback function to navigate back to the main calculator.
     * @param {function} config.formatCurrency - Reference to the main currency formatting function.
     */
    function init(config) {
        onGoToCalculatorCallback = config.onGoToCalculator;
        // Assume formatCurrency is available globally or passed in config
        // For now, directly referencing window.formatCurrency as it's global
        if (typeof window.formatCurrency !== 'function') {
            console.error("formatCurrency function not found. Please ensure it's loaded globally.");
            window.formatCurrency = (amount) => `$${amount.toFixed(2)}`; // Fallback
        }

        // Get UI element references
        savedProjectsContainer = document.getElementById('savedProjectsContainer');
        customerFilterInput = document.getElementById('customerFilterInput');
        projectsList = document.getElementById('projectsList');
        goToCalculatorBtn = document.getElementById('goToCalculatorBtn');
        customerProjectsPieChartCanvas = document.getElementById('customerProjectsPieChart');
        noCustomerDataMessage = document.getElementById('noCustomerDataMessage');
        noProjectsMessage = document.getElementById('noProjectsMessage');


        // Attach event listeners
        if (goToCalculatorBtn) {
            goToCalculatorBtn.addEventListener('click', onGoToCalculatorCallback);
        }
        if (customerFilterInput) {
            customerFilterInput.addEventListener('input', filterAndRenderProjects);
        }

        // Initial render
        renderProjects(savedProjectsData);
        updateCustomerTotalsChart(savedProjectsData);
    }

    /**
     * Filters projects based on the customer filter input and re-renders the list.
     */
    function filterAndRenderProjects() {
        const searchTerm = customerFilterInput.value.toLowerCase();
        const filteredProjects = savedProjectsData.filter(project =>
            project.customerName.toLowerCase().includes(searchTerm) ||
            project.projectName.toLowerCase().includes(searchTerm)
        );
        renderProjects(filteredProjects);
        updateCustomerTotalsChart(filteredProjects); // Update chart based on filtered data
    }

    /**
     * Renders the list of projects into the DOM.
     * @param {Array<object>} projectsToRender - The array of project objects to display.
     */
    function renderProjects(projectsToRender) {
        projectsList.innerHTML = ''; // Clear existing projects

        if (projectsToRender.length === 0) {
            noProjectsMessage.classList.remove('hidden');
            return;
        } else {
            noProjectsMessage.classList.add('hidden');
        }

        projectsToRender.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-id', project.id); // Store ID for actions
            projectCard.innerHTML = `
                <h3 class="font-semibold text-lg mb-2">${project.projectName}</h3>
                <p class="text-sm text-gray-600 dark:text-a0aec0">Customer: <strong>${project.customerName}</strong></p>
                <p class="text-sm text-gray-600 dark:text-a0aec0">Type: ${project.projectType} | State: ${project.projectState}</p>
                <p class="text-sm text-gray-600 dark:text-a0aec0">Total: <strong>${window.formatCurrency(project.totalProposal)}</strong></p>
                <p class="text-sm text-gray-600 dark:text-a0aec0">Last Saved: ${project.lastSavedDate}</p>
                
                <div class="flex items-center justify-between mt-4">
                    <label for="status-${project.id}" class="text-sm text-gray-600 dark:text-a0aec0 mr-2">Status:</label>
                    <select id="status-${project.id}" class="input-field status-select text-sm p-1" onchange="window.SavedProjects.updateProjectStatus('${project.id}', this.value)">
                        <option value="Draft" ${project.status === 'Draft' ? 'selected' : ''}>Draft</option>
                        <option value="Pending Review" ${project.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                        <option value="Awarded" ${project.status === 'Awarded' ? 'selected' : ''}>Awarded</option>
                        <option value="Rejected" ${project.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </div>
                
                <div class="flex justify-end gap-2 mt-4">
                    <button class="btn btn-primary btn-sm load-project-btn" data-id="${project.id}">Load</button>
                    <button class="btn btn-red btn-sm delete-project-btn" data-id="${project.id}">Delete</button>
                </div>
            `;
            projectsList.appendChild(projectCard);
        });

        // Attach event listeners to newly rendered buttons
        projectsList.querySelectorAll('.load-project-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const projectId = event.target.dataset.id;
                loadProject(projectId);
            });
        });

        projectsList.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const projectId = event.target.dataset.id;
                deleteProject(projectId);
            });
        });
    }

    /**
     * Updates the status of a project.
     * In a real app, this would also update persistent storage (Firestore).
     * @param {string} projectId - The ID of the project to update.
     * @param {string} newStatus - The new status to set.
     */
    function updateProjectStatus(projectId, newStatus) {
        const projectIndex = savedProjectsData.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            savedProjectsData[projectIndex].status = newStatus;
            // In a real application, you'd send this update to Firestore here.
            console.log(`Project ${projectId} status updated to: ${newStatus}`);
            // Re-render to ensure any visual updates or chart updates based on status
            renderProjects(savedProjectsData);
            updateCustomerTotalsChart(savedProjectsData);
            window.renderMessageBox(`Project "${savedProjectsData[projectIndex].projectName}" status updated to ${newStatus}.`);
        }
    }

    /**
     * Handles loading a project.
     * For now, this is a placeholder. Real implementation would involve
     * loading projectDetails into the main app's projectSettings and estimateItems.
     * @param {string} projectId - The ID of the project to load.
     */
    function loadProject(projectId) {
        const projectToLoad = savedProjectsData.find(p => p.id === projectId);
        if (projectToLoad) {
            window.renderMessageBox(`Loading project: "${projectToLoad.projectName}"... (Not fully implemented yet)`);
            // In a real app:
            // 1. Prompt user to confirm unsaved changes if current project is modified.
            // 2. Load projectToLoad.projectDetails (assuming it holds stringified projectSettings/estimateItems)
            //    into the main app's global projectSettings and estimateItems.
            // 3. Call onGoToCalculatorCallback();
        } else {
            window.renderMessageBox('Project not found!');
        }
    }

    /**
     * Handles deleting a project.
     * For now, this is a placeholder. Real implementation would involve
     * confirming with the user and deleting from persistent storage (Firestore).
     * @param {string} projectId - The ID of the project to delete.
     */
    function deleteProject(projectId) {
        window.renderMessageBox(`Are you sure you want to delete project: "${savedProjectsData.find(p => p.id === projectId)?.projectName || projectId}"? This action cannot be undone.`,
            () => {
                savedProjectsData = savedProjectsData.filter(p => p.id !== projectId);
                renderProjects(savedProjectsData); // Re-render after deletion
                updateCustomerTotalsChart(savedProjectsData); // Update chart
                window.renderMessageBox('Project deleted successfully.');
                window.closeMessageBox(); // Close the confirmation box
            },
            true // isConfirm: true
        );
    }

    /**
     * Generates and updates the pie chart showing total proposal by customer.
     * @param {Array<object>} projects - The array of projects (can be filtered or unfiltered).
     * @param {boolean} isDarkTheme - Current theme state for chart colors (will be passed from main script later).
     */
    function updateCustomerTotalsChart(projects, isDarkTheme = false) { // isDarkTheme is hardcoded for now
        const customerTotals = {};
        projects.forEach(project => {
            if (project.customerName && project.totalProposal !== undefined) {
                customerTotals[project.customerName] = (customerTotals[project.customerName] || 0) + project.totalProposal;
            }
        });

        const labels = Object.keys(customerTotals);
        const data = Object.values(customerTotals);

        if (data.length === 0) {
            if (customerProjectsPieChart) {
                customerProjectsPieChart.destroy(); // Destroy existing chart if no data
                customerProjectsPieChart = null;
            }
            customerProjectsPieChartCanvas.classList.add('hidden');
            noCustomerDataMessage.classList.remove('hidden');
            return;
        } else {
            customerProjectsPieChartCanvas.classList.remove('hidden');
            noCustomerDataMessage.classList.add('hidden');
        }

        // Define a set of consistent colors for the pie chart
        const baseColors = [
            '#2563eb', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#d946ef', '#0ea5e9', '#eab308', '#64748b'
        ];
        const backgroundColors = data.map((_, i) => baseColors[i % baseColors.length]);
        
        // Adjust border colors based on theme, ensuring contrast
        const borderColors = backgroundColors.map(color => {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            // Simple logic to make border lighter/darker
            if (isDarkTheme) {
                return `rgba(${r + 30}, ${g + 30}, ${b + 30}, 1)`; // Slightly lighter border for dark theme
            } else {
                return `rgba(${r - 30}, ${g - 30}, ${b - 30}, 1)`; // Slightly darker border for light theme
            }
        });

        if (customerProjectsPieChart) {
            customerProjectsPieChart.data.labels = labels;
            customerProjectsPieChart.data.datasets[0].data = data;
            customerProjectsPieChart.data.datasets[0].backgroundColor = backgroundColors;
            customerProjectsPieChart.data.datasets[0].borderColor = borderColors;
            customerProjectsPieChart.options.plugins.legend.labels.color = isDarkTheme ? '#e2e8f0' : '#4b5563';
            customerProjectsPieChart.options.plugins.tooltip.titleColor = isDarkTheme ? '#e2e8f0' : '#4b5563';
            customerProjectsPieChart.options.plugins.tooltip.bodyColor = isDarkTheme ? '#e2e8f0' : '#4b5563';
            customerProjectsPieChart.options.plugins.tooltip.backgroundColor = isDarkTheme ? '#2d3748' : 'rgba(0,0,0,0.8)';
            customerProjectsPieChart.options.plugins.tooltip.borderColor = isDarkTheme ? '#4a5568' : '#e5e7eb';
            customerProjectsPieChart.update();
        } else {
            const ctx = customerProjectsPieChartCanvas.getContext('2d');
            customerProjectsPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: isDarkTheme ? '#e2e8f0' : '#4b5563',
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += window.formatCurrency(context.parsed);
                                    }
                                    return label;
                                }
                            },
                            titleColor: isDarkTheme ? '#e2e8f0' : '#4b5563',
                            bodyColor: isDarkTheme ? '#e2e8f0' : '#4b5563',
                            backgroundColor: isDarkTheme ? '#2d3748' : 'rgba(0,0,0,0.8)',
                            borderColor: isDarkTheme ? '#4a5568' : '#e5e7eb',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12
                        }
                    }
                }
            });
        }
    }

    // Expose public methods
    return {
        init: init,
        renderProjects: renderProjects, // Might be useful for external triggers
        updateProjectStatus: updateProjectStatus // Expose for onchange in HTML
    };
})();

