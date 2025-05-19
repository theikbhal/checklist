document.addEventListener('DOMContentLoaded', () => {
    // Tab handling
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Common elements
    const checklist = document.getElementById('checklist');
    const shareLink = document.getElementById('shareLink');
    const viewRadios = document.querySelectorAll('input[name="view"]');
    const gridOptions = document.querySelector('.grid-options');
    const columnsInput = document.getElementById('columns');

    // Generate tab elements
    const goalInput = document.getElementById('goal');
    const quantitySelect = document.getElementById('quantity');
    const customQuantityInput = document.getElementById('customQuantity');
    const generateBtn = document.getElementById('generateBtn');
    const highLevelNotes = document.getElementById('highLevelNotes');

    // Normal tab elements
    const normalTitle = document.getElementById('normalTitle');
    const normalNotes = document.getElementById('normalNotes');
    const addNormalItemBtn = document.getElementById('addNormalItemBtn');

    // Bulk tab elements
    const bulkTitle = document.getElementById('bulkTitle');
    const bulkItems = document.getElementById('bulkItems');
    const bulkNotes = document.getElementById('bulkNotes');
    const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');

    // Template tab elements
    const templateTitle = document.getElementById('templateTitle');
    const templateQuantity = document.getElementById('templateQuantity');
    const templateItems = document.getElementById('templateItems');
    const templateNotes = document.getElementById('templateNotes');
    const templateGenerateBtn = document.getElementById('templateGenerateBtn');

    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const titleParam = urlParams.get('title');
    const quantityParam = urlParams.get('quantity');
    const viewParam = urlParams.get('view');
    const columnsParam = urlParams.get('columns');
    const notesParam = urlParams.get('notes');
    const currentParam = urlParams.get('current');
    const itemsParam = urlParams.get('items');
    const templateParam = urlParams.get('template');

    if (titleParam) {
        goalInput.value = decodeURIComponent(titleParam);
        normalTitle.value = decodeURIComponent(titleParam);
        bulkTitle.value = decodeURIComponent(titleParam);
        templateTitle.value = decodeURIComponent(titleParam);
    }
    if (quantityParam) {
        const quantity = parseInt(quantityParam);
        if (quantity > 0 && quantity <= 100) {
            customQuantityInput.value = quantity;
            quantitySelect.value = 'custom';
            templateQuantity.value = quantity;
        }
    }
    if (viewParam) {
        const viewRadio = document.querySelector(`input[name="view"][value="${viewParam}"]`);
        if (viewRadio) {
            viewRadio.checked = true;
            updateView();
        }
    }
    if (columnsParam) {
        columnsInput.value = columnsParam;
    }
    if (notesParam) {
        highLevelNotes.value = decodeURIComponent(notesParam);
        normalNotes.value = decodeURIComponent(notesParam);
        bulkNotes.value = decodeURIComponent(notesParam);
        templateNotes.value = decodeURIComponent(notesParam);
    }

    // Load saved checklist from localStorage
    loadChecklist();

    // Handle view changes
    viewRadios.forEach(radio => {
        radio.addEventListener('change', updateView);
    });

    function updateView() {
        const selectedView = document.querySelector('input[name="view"]:checked').value;
        checklist.className = 'checklist ' + selectedView + '-view';
        
        if (selectedView === 'grid') {
            gridOptions.style.display = 'block';
            updateGridLayout();
        } else {
            gridOptions.style.display = 'none';
        }
    }

    function updateGridLayout() {
        const columns = parseInt(columnsInput.value) || 3;
        checklist.style.setProperty('--columns', columns);
    }

    // Handle grid view changes
    columnsInput.addEventListener('input', updateGridLayout);

    // Handle custom quantity input
    customQuantityInput.addEventListener('input', () => {
        if (customQuantityInput.value) {
            quantitySelect.value = 'custom';
        }
    });

    quantitySelect.addEventListener('change', () => {
        if (quantitySelect.value !== 'custom') {
            customQuantityInput.value = '';
        }
    });

    // Generate tab functionality
    generateBtn.addEventListener('click', () => {
        const goal = goalInput.value.trim();
        let quantity;

        if (customQuantityInput.value) {
            quantity = parseInt(customQuantityInput.value);
            if (quantity < 1 || quantity > 100) {
                alert('Please enter a quantity between 1 and 100');
                return;
            }
        } else {
            quantity = parseInt(quantitySelect.value);
        }

        if (!goal) {
            alert('Please enter a goal');
            return;
        }

        generateChecklist(goal, quantity);
        updateShareLink();
    });

    // Normal tab functionality
    addNormalItemBtn.addEventListener('click', () => {
        const title = normalTitle.value.trim();
        if (!title) {
            alert('Please enter a checklist title');
            return;
        }
        // Clear checklist if not already in normal mode
        if (!document.querySelector('.tab-btn[data-tab="normal"]').classList.contains('active')) {
            checklist.innerHTML = '';
        }
        // If checklist is empty, add the title as the first item
        if (checklist.children.length === 0) {
            const titleItem = createChecklistItem(title, false);
            checklist.appendChild(titleItem);
        }
        const item = createChecklistItem('New Item', true);
        checklist.appendChild(item);
        saveChecklist();
        updateShareLink();
    });

    // Bulk tab functionality
    bulkGenerateBtn.addEventListener('click', () => {
        const title = bulkTitle.value.trim();
        const items = bulkItems.value.trim().split('\n').filter(item => item.trim());
        
        if (!title) {
            alert('Please enter a checklist title');
            return;
        }
        if (items.length === 0) {
            alert('Please enter at least one item');
            return;
        }

        checklist.innerHTML = '';
        items.forEach(itemText => {
            const item = createChecklistItem(itemText.trim());
            checklist.appendChild(item);
        });
        saveChecklist();
        updateShareLink();
    });

    // Template tab functionality
    templateGenerateBtn.addEventListener('click', () => {
        const title = templateTitle.value.trim();
        const quantity = parseInt(templateQuantity.value);
        const templateItemsList = templateItems.value.trim().split('\n').filter(item => item.trim());
        
        if (!title) {
            alert('Please enter a template title');
            return;
        }
        if (quantity < 1 || quantity > 100) {
            alert('Please enter a quantity between 1 and 100');
            return;
        }
        if (templateItemsList.length === 0) {
            alert('Please enter at least one template item');
            return;
        }

        checklist.innerHTML = '';
        for (let i = 1; i <= quantity; i++) {
            const item = createChecklistItem(`${title} ${i}`);
            templateItemsList.forEach(templateItem => {
                const subItem = createSubItem(templateItem.trim());
                item.querySelector('.checklist-subitems').appendChild(subItem);
            });
            checklist.appendChild(item);
        }
        saveChecklist();
        updateShareLink();
    });

    function generateChecklist(goal, quantity) {
        checklist.innerHTML = '';
        for (let i = 1; i <= quantity; i++) {
            const item = createChecklistItem(`${goal} ${i}`);
            checklist.appendChild(item);
        }
        saveChecklist();
    }

    function createChecklistItem(text, isEditable = false) {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'checklist-item-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `item-${Date.now()}-${Math.random()}`;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = text;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'checklist-item-actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startEditing(div, label);
        });

        const addSubBtn = document.createElement('button');
        addSubBtn.textContent = '+';
        addSubBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addSubItem(div);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            div.remove();
            saveChecklist();
            updateShareLink();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(addSubBtn);
        actionsDiv.appendChild(deleteBtn);

        const notesDiv = document.createElement('div');
        notesDiv.className = 'checklist-item-notes';
        const notesTextarea = document.createElement('textarea');
        notesTextarea.placeholder = 'Add notes...';
        notesDiv.appendChild(notesTextarea);

        const subItemsDiv = document.createElement('div');
        subItemsDiv.className = 'checklist-subitems';

        // Handle click to mark
        contentDiv.addEventListener('click', (e) => {
            if (e.target !== checkbox && e.target !== notesTextarea) {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    div.classList.add('completed');
                } else {
                    div.classList.remove('completed');
                }
                saveChecklist();
            }
        });

        // Handle click to set as current
        contentDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            document.querySelectorAll('.checklist-item').forEach(item => {
                item.classList.remove('current');
            });
            div.classList.add('current');
            saveChecklist();
        });

        // Handle click to expand/collapse notes and sub-items
        contentDiv.addEventListener('dblclick', () => {
            div.classList.toggle('expanded');
            saveChecklist();
        });

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                div.classList.add('completed');
            } else {
                div.classList.remove('completed');
            }
            saveChecklist();
        });

        notesTextarea.addEventListener('input', () => {
            saveChecklist();
        });

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(label);
        contentDiv.appendChild(actionsDiv);
        div.appendChild(contentDiv);
        div.appendChild(notesDiv);
        div.appendChild(subItemsDiv);

        if (isEditable) {
            startEditing(div, label);
        }

        return div;
    }

    function createSubItem(text) {
        const div = document.createElement('div');
        div.className = 'checklist-subitem';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `subitem-${Date.now()}-${Math.random()}`;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = text;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#6c757d';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = '#333';
            }
            saveChecklist();
        });

        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    function startEditing(itemDiv, label) {
        const text = label.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        input.className = 'edit-input';
        
        itemDiv.classList.add('editing');
        label.parentNode.insertBefore(input, label);
        
        input.focus();
        input.select();

        function finishEditing() {
            if (input.value.trim()) {
                label.textContent = input.value.trim();
            }
            itemDiv.classList.remove('editing');
            input.remove();
            saveChecklist();
        }

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
    }

    function addSubItem(parentItem) {
        const subItemsDiv = parentItem.querySelector('.checklist-subitems');
        const subItem = createSubItem('New sub-item');
        subItemsDiv.appendChild(subItem);
        parentItem.classList.add('expanded');
        saveChecklist();
    }

    function saveChecklist() {
        const items = Array.from(checklist.children).map(item => ({
            text: item.querySelector('label').textContent,
            completed: item.querySelector('input[type="checkbox"]').checked,
            notes: item.querySelector('textarea').value,
            expanded: item.classList.contains('expanded'),
            current: item.classList.contains('current'),
            subItems: Array.from(item.querySelector('.checklist-subitems').children).map(subItem => ({
                text: subItem.querySelector('label').textContent,
                completed: subItem.querySelector('input[type="checkbox"]').checked
            }))
        }));
        localStorage.setItem('checklist', JSON.stringify(items));
        localStorage.setItem('highLevelNotes', highLevelNotes.value);
    }

    function loadChecklist() {
        const savedItems = localStorage.getItem('checklist');
        const savedNotes = localStorage.getItem('highLevelNotes');
        
        if (savedNotes) {
            highLevelNotes.value = savedNotes;
            normalNotes.value = savedNotes;
            bulkNotes.value = savedNotes;
            templateNotes.value = savedNotes;
        }

        if (savedItems) {
            const items = JSON.parse(savedItems);
            items.forEach(item => {
                const div = createChecklistItem(item.text);
                if (item.completed) {
                    div.classList.add('completed');
                    div.querySelector('input[type="checkbox"]').checked = true;
                }
                if (item.expanded) {
                    div.classList.add('expanded');
                }
                if (item.current) {
                    div.classList.add('current');
                }
                div.querySelector('textarea').value = item.notes;
                if (Array.isArray(item.subItems)) {
                    item.subItems.forEach(subItem => {
                        const subItemDiv = createSubItem(subItem.text);
                        if (subItem.completed) {
                            subItemDiv.querySelector('input[type="checkbox"]').checked = true;
                            subItemDiv.querySelector('label').style.textDecoration = 'line-through';
                            subItemDiv.querySelector('label').style.color = '#6c757d';
                        }
                        div.querySelector('.checklist-subitems').appendChild(subItemDiv);
                    });
                }
                checklist.appendChild(div);
            });
        }
    }

    function updateShareLink() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        let params = new URLSearchParams();
        
        switch (activeTab) {
            case 'generate':
                params.append('title', goalInput.value.trim());
                params.append('quantity', customQuantityInput.value || quantitySelect.value);
                break;
            case 'normal':
                params.append('title', normalTitle.value.trim());
                break;
            case 'bulk':
                params.append('title', bulkTitle.value.trim());
                params.append('items', bulkItems.value.trim());
                break;
            case 'template':
                params.append('title', templateTitle.value.trim());
                params.append('quantity', templateQuantity.value);
                params.append('template', templateItems.value.trim());
                break;
        }

        const view = document.querySelector('input[name="view"]:checked').value;
        params.append('view', view);

        if (view === 'grid') {
            params.append('columns', columnsInput.value);
        }

        const notes = highLevelNotes.value;
        if (notes) {
            params.append('notes', notes);
        }

        const currentItem = document.querySelector('.checklist-item.current');
        const currentIndex = currentItem ? Array.from(checklist.children).indexOf(currentItem) : -1;
        if (currentIndex !== -1) {
            params.append('current', currentIndex);
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        shareLink.value = shareUrl;
    }

    // Update share link when inputs change
    goalInput.addEventListener('input', updateShareLink);
    quantitySelect.addEventListener('change', updateShareLink);
    customQuantityInput.addEventListener('input', updateShareLink);
    viewRadios.forEach(radio => radio.addEventListener('change', updateShareLink));
    columnsInput.addEventListener('input', updateShareLink);
    highLevelNotes.addEventListener('input', updateShareLink);
    normalTitle.addEventListener('input', updateShareLink);
    normalNotes.addEventListener('input', updateShareLink);
    bulkTitle.addEventListener('input', updateShareLink);
    bulkItems.addEventListener('input', updateShareLink);
    bulkNotes.addEventListener('input', updateShareLink);
    templateTitle.addEventListener('input', updateShareLink);
    templateQuantity.addEventListener('input', updateShareLink);
    templateItems.addEventListener('input', updateShareLink);
    templateNotes.addEventListener('input', updateShareLink);

    // Initial setup
    updateView();
    updateShareLink();
}); 