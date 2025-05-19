document.addEventListener('DOMContentLoaded', () => {
    const goalInput = document.getElementById('goal');
    const quantitySelect = document.getElementById('quantity');
    const generateBtn = document.getElementById('generateBtn');
    const checklist = document.getElementById('checklist');

    // Load saved checklist from localStorage
    loadChecklist();

    generateBtn.addEventListener('click', () => {
        const goal = goalInput.value.trim();
        const quantity = parseInt(quantitySelect.value);

        if (!goal) {
            alert('Please enter a goal');
            return;
        }

        generateChecklist(goal, quantity);
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
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `item-${Date.now()}-${Math.random()}`;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = text;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                div.classList.add('completed');
            } else {
                div.classList.remove('completed');
            }
            saveChecklist();
        });

        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    function saveChecklist() {
        const items = Array.from(checklist.children).map(item => ({
            text: item.querySelector('label').textContent,
            completed: item.querySelector('input').checked
        }));
        localStorage.setItem('checklist', JSON.stringify(items));
    }

    function loadChecklist() {
        const savedItems = localStorage.getItem('checklist');
        if (savedItems) {
            const items = JSON.parse(savedItems);
            items.forEach(item => {
                const div = createChecklistItem(item.text);
                if (item.completed) {
                    div.classList.add('completed');
                    div.querySelector('input').checked = true;
                }
                checklist.appendChild(div);
            });
        }
    }
}); 