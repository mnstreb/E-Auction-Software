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
    let renderMessageBoxCallback; // Passed from main script for message box
    let closeMessageBoxCallback; // Passed from main script for closing message box

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
            // projectDetails will be a stringified JSON of projectSettings and estimateItems
            projectDetails: '{"settings": {}, "items": []}' 
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
            projectDetails: '{"settings": {}, "items": []}'
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
            projectDetails: '{"settings": {}, "items": []}'
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
            projectDetails: '{"settings": {}, "items": []}'
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
            projectDetails: '{"settings": {}, "items": []}'
        }
    ];

    /**
     * Initializes the SavedProjects module.
     * @param {object} config - Configuration object.
     * @param {function} config.onGoToCalculator - Callback function to navigate back to the main calculator.
     * @param {function} config.formatCurrency - Reference to the main currency formatting function.
     * @param {boolean} config.isDarkTheme - Current theme state for chart colors.
     * @param {function} config.renderMessageBox - Reference to the global renderMessageBox function.
     * @param {function} config.closeMessageBox - Reference to the global closeMessageBox function.
     */
    function init(config) {
        onGoToCalculatorCallback = config.onGoToCalculator;
        renderMessageBoxCallback = config.renderMessageBox;
        closeMessageBoxCallback = config.closeMessageBox;
        // Assume formatCurrency is available globally or passed in config
        // For now, directly referencing window.formatCurrency as it's global
        if (typeof window.formatCurrency !== 'function') {
            console.error("formatCurrency function not found. Please ensure it's loaded globally.");
            window.formatCurrency = (amount) => `$${amount.toFixed(2)}`; // Fallback
        }
        // Ensure isDarkTheme is also passed
        if (typeof config.isDarkTheme === 'undefined') {
             console.warn("isDarkTheme not passed to SavedProjects.init. Chart colors might be incorrect.");
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
            customerFilterInput.addEventListener('input', () => filterAndRenderProjects(config.isDarkTheme));
        }

        // Initial render
        renderProjects(savedProjectsData);
        updateCustomerTotalsChart(savedProjectsData, config.isDarkTheme);
    }

    /**
     * Adds a new project to the saved projects data and re-renders the list.
     * @param {object} newProject - The new project object to add.
     */
    function addProject(newProject) {
        // Check if a project with the same name and customer already exists to prevent duplicates
        const existingProjectIndex = savedProjectsData.findIndex(p => 
            p.projectName === newProject.projectName && p.customerName === newProject.customerName
        );

        if (existingProjectIndex !== -1) {
            // Optionally, update the existing project or notify the user
            renderMessageBoxCallback(`Project "${newProject.projectName}" for "${newProject.customerName}" already exists. Updating its details.`);
            savedProjectsData[existingProjectIndex] = {
                ...savedProjectsData[existingProjectIndex], // Keep old ID
                ...newProject, // Override with new details
                lastSavedDate: new Date().toISOString().split('T')[0] // Update last saved date
            };
        } else {
            savedProjectsData.push(newProject);
        }
        // Sort projects alphabetically by project name for consistency
        savedProjectsData.sort((a, b) => a.projectName.localeCompare(b.projectName));
        filterAndRenderProjects(); // Re-filter and re-render the displayed list
    }

    /**
     * Returns the current in-memory saved projects data.
     * This will be useful when loading projects or re-rendering from outside the module.
     * @returns {Array<object>} The current array of saved project objects.
     */
    function getSavedProjectsData() {
        return savedProjectsData;
    }


    /**
     * Filters projects based on the customer filter input and re-renders the list.
     * @param {boolean} isDarkTheme - Current theme state for chart colors.
     */
    function filterAndRenderProjects(isDarkTheme) {
        const searchTerm = customerFilterInput.value.toLowerCase();
        const filteredProjects = savedProjectsData.filter(project =>
            project.customerName.toLowerCase().includes(searchTerm) ||
            project.projectName.toLowerCase().includes(searchTerm)
        );
        renderProjects(filteredProjects);
        updateCustomerTotalsChart(filteredProjects, isDarkTheme); // Update chart based on filtered data
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

        // Attach event listeners to newly rendered buttons (using delegation or direct attachment)
        // Using direct attachment here for simplicity as elements are re-rendered each time
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
            // Prevent changing from Awarded/Rejected back to Draft/Pending without confirmation
            const currentStatus = savedProjectsData[projectIndex].status;
            if (['Awarded', 'Rejected'].includes(currentStatus) && ['Draft', 'Pending Review'].includes(newStatus)) {
                renderMessageBoxCallback(`Changing status from "${currentStatus}" to "${newStatus}" is usually not recommended. Are you sure?`,
                    () => {
                        savedProjectsData[projectIndex].status = newStatus;
                        renderMessageBoxCallback(`Project "${savedProjectsData[projectIndex].projectName}" status updated to ${newStatus}.`);
                        filterAndRenderProjects(savedProjectsContainer.classList.contains('dark-theme')); // Re-render and update chart
                        closeMessageBoxCallback();
                    },
                    true // isConfirm: true
                );
            } else {
                savedProjectsData[projectIndex].status = newStatus;
                renderMessageBoxCallback(`Project "${savedProjectsData[projectIndex].projectName}" status updated to ${newStatus}.`);
                filterAndRenderProjects(savedProjectsContainer.classList.contains('dark-theme')); // Re-render and update chart
            }
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
            renderMessageBoxCallback(`Loading project: "${projectToLoad.projectName}"... (Not fully implemented yet)`);
            
            // This is where you would parse and load the actual project details
            // into the main application's global `projectSettings` and `estimateItems`.
            // Example (assuming projectDetails is a stringified JSON):
            // const loadedData = JSON.parse(projectToLoad.projectDetails);
            // window.projectSettings = loadedData.settings; // Assuming projectSettings is global in index.html
            // window.estimateItems = loadedData.items;     // Assuming estimateItems is global in index.html
            // window.renderItems(); // Trigger re-render of main table
            
            // After loading, go back to calculator view
            onGoToCalculatorCallback();
        } else {
            renderMessageBoxCallback('Project not found!');
        }
    }

    /**
     * Handles deleting a project.
     * For now, this is a placeholder. Real implementation would involve
     * confirming with the user and deleting from persistent storage (Firestore).
     * @param {string} projectId - The ID of the project to delete.
     */
    function deleteProject(projectId) {
        const projectToDelete = savedProjectsData.find(p => p.id === projectId);
        if (!projectToDelete) {
            renderMessageBoxCallback('Project not found for deletion!');
            return;
        }

        renderMessageBoxCallback(`Are you sure you want to delete project: "${projectToDelete.projectName}"? This action cannot be undone.`,
            () => {
                savedProjectsData = savedProjectsData.filter(p => p.id !== projectId);
                filterAndRenderProjects(savedProjectsContainer.classList.contains('dark-theme')); // Re-render and update chart
                renderMessageBoxCallback('Project deleted successfully.');
                closeMessageBoxCallback();
            },
            true // isConfirm: true
        );
    }

    /**
     * Generates and updates the pie chart showing total proposal by customer.
     * @param {Array<object>} projects - The array of projects (can be filtered or unfiltered).
     * @param {boolean} isDarkTheme - Current theme state for chart colors.
     */
    function updateCustomerTotalsChart(projects, isDarkTheme) {
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
                return `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 1)`; // Slightly lighter border for dark theme
            } else {
                return `rgba(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)}, 1)`; // Slightly darker border for light theme
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
        updateProjectStatus: updateProjectStatus, // Expose for onchange in HTML
        addProject: addProject, // NEW: Expose addProject for index.html
        getSavedProjectsData: getSavedProjectsData, // NEW: Expose data getter for index.html
        updateCustomerTotalsChart: updateCustomerTotalsChart // Expose for theme toggling
    };
})();
