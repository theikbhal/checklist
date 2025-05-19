document.addEventListener('DOMContentLoaded', () => {
    const goalInput = document.getElementById('goal');
    const quantitySelect = document.getElementById('quantity');
    const customQuantityInput = document.getElementById('customQuantity');
    const generateBtn = document.getElementById('generateBtn');
    const checklist = document.getElementById('checklist');
    const shareLink = document.getElementById('shareLink');
    const viewRadios = document.querySelectorAll('input[name="view"]');
    const gridOptions = document.querySelector('.grid-options');
    const columnsInput = document.getElementById('columns');
    const highLevelNotes = document.getElementById('highLevelNotes');

    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const titleParam = urlParams.get('title');
    const quantityParam = urlParams.get('quantity');
    const viewParam = urlParams.get('view');
    const columnsParam = urlParams.get('columns');
    const notesParam = urlParams.get('notes');
    const currentParam = urlParams.get('current');

    if (titleParam) {
        goalInput.value = decodeURIComponent(titleParam);
    }
    if (quantityParam) {
        const quantity = parseInt(quantityParam);
        if (quantity > 0 && quantity <= 100) {
            customQuantityInput.value = quantity;
            quantitySelect.value = 'custom';
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

    function generateChecklist(goal, quantity) {
        // Clear existing checklist
        checklist.innerHTML = '';

        // Generate new checklist items
        for (let i = 1; i <= quantity; i++) {
            const item = createChecklistItem(`${goal} ${i}`);
            checklist.appendChild(item);
        }

        // Save to localStorage
        saveChecklist();
    }

    function createChecklistItem(text) {
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

        const notesDiv = document.createElement('div');
        notesDiv.className = 'checklist-item-notes';
        const notesTextarea = document.createElement('textarea');
        notesTextarea.placeholder = 'Add notes...';
        notesDiv.appendChild(notesTextarea);

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
            // Remove current class from all items
            document.querySelectorAll('.checklist-item').forEach(item => {
                item.classList.remove('current');
            });
            // Add current class to clicked item
            div.classList.add('current');
            saveChecklist();
        });

        // Handle click to expand/collapse notes
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
        div.appendChild(contentDiv);
        div.appendChild(notesDiv);
        return div;
    }

    function saveChecklist() {
        const items = Array.from(checklist.children).map(item => ({
            text: item.querySelector('label').textContent,
            completed: item.querySelector('input').checked,
            notes: item.querySelector('textarea').value,
            expanded: item.classList.contains('expanded'),
            current: item.classList.contains('current')
        }));
        localStorage.setItem('checklist', JSON.stringify(items));
        localStorage.setItem('highLevelNotes', highLevelNotes.value);
    }

    function loadChecklist() {
        const savedItems = localStorage.getItem('checklist');
        const savedNotes = localStorage.getItem('highLevelNotes');
        
        if (savedNotes) {
            highLevelNotes.value = savedNotes;
        }

        if (savedItems) {
            const items = JSON.parse(savedItems);
            items.forEach(item => {
                const div = createChecklistItem(item.text);
                if (item.completed) {
                    div.classList.add('completed');
                    div.querySelector('input').checked = true;
                }
                if (item.expanded) {
                    div.classList.add('expanded');
                }
                if (item.current) {
                    div.classList.add('current');
                }
                div.querySelector('textarea').value = item.notes;
                checklist.appendChild(div);
            });
        }
    }

    function updateShareLink() {
        const goal = goalInput.value.trim();
        const quantity = customQuantityInput.value || quantitySelect.value;
        const view = document.querySelector('input[name="view"]:checked').value;
        const columns = columnsInput.value;
        const notes = highLevelNotes.value;
        const currentItem = document.querySelector('.checklist-item.current');
        const currentIndex = currentItem ? Array.from(checklist.children).indexOf(currentItem) : -1;

        const params = new URLSearchParams({
            title: goal,
            quantity: quantity,
            view: view
        });

        if (view === 'grid') {
            params.append('columns', columns);
        }

        if (notes) {
            params.append('notes', notes);
        }

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

    // Initial setup
    updateView();
    updateShareLink();
}); 