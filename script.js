document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    // Функция форматирования числа
    function formatNumber(num) {
        return Number(num).toFixed(1).replace('.', ',');
    }

    // Функция парсинга локального формата числа
    function parseLocalNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(',', '.')) || 0;
    }

    // Обработчики для полей ввода
    function addInputHandlers(row) {
        const fromInput = row.querySelector('.from');
        const toInput = row.querySelector('.to');
        
        function handleNumberInput(e) {
            const input = e.target;
            const value = input.value;
            
            // Разрешаем только цифры, запятую и точку
            if (!/^[0-9,.]$/.test(e.data) && e.data !== null) {
                e.preventDefault();
                return;
            }

            // Заменяем точку на запятую
            if (e.data === '.') {
                e.preventDefault();
                const start = input.selectionStart - 1;
                input.value = value.slice(0, start) + ',' + value.slice(start + 1);
                input.setSelectionRange(start + 1, start + 1);
                return;
            }

            // Форматируем число только при потере фокуса
            input.addEventListener('blur', function() {
                const num = parseLocalNumber(this.value);
                this.value = formatNumber(num);
            }, { once: true });
        }

        fromInput.addEventListener('beforeinput', handleNumberInput);
        toInput.addEventListener('beforeinput', handleNumberInput);
        
        fromInput.addEventListener('blur', function() {
            calculateTotal();
        });
        
        toInput.addEventListener('blur', function() {
            calculateTotal();
            // Обновляем поле "От" в следующей строке
            const nextRow = this.closest('tr').nextElementSibling;
            if (nextRow) {
                const nextFromInput = nextRow.querySelector('.from');
                if (nextFromInput) {
                    nextFromInput.value = this.value;
                }
            }
        });
    }

    // Функция расчета общей глубины
    function calculateTotal() {
        document.querySelectorAll('#geologyTable tbody tr').forEach(row => {
            const fromInput = row.querySelector('.from');
            const toInput = row.querySelector('.to');
            const totalInput = row.querySelector('.total');
            
            if (fromInput && toInput && totalInput) {
                const fromValue = parseLocalNumber(fromInput.value) || 0;
                const toValue = parseLocalNumber(toInput.value) || 0;
                const total = Math.abs(toValue - fromValue);
                totalInput.value = formatNumber(total);
            }
        });
    }

    // Добавление новой строки
    function addNewRow() {
        const tbody = document.querySelector('#geologyTable tbody');
        const lastRow = tbody.lastElementChild;
        const newRow = document.createElement('tr');
        const rowCount = tbody.children.length + 1;
        
        // Получаем значение "До" из последней строки
        const lastToValue = lastRow ? lastRow.querySelector('.to').value || '0,0' : '0,0';
        
        newRow.innerHTML = `
            <td><input type="text" name="age${rowCount}" class="age" required></td>
            <td>
                <select name="layer${rowCount}" class="layer layer-select" required>
                    <option value="">Виберіть шар...</option>
                </select>
            </td>
            <td><input type="text" name="from${rowCount}" class="from" required value="${lastToValue}"></td>
            <td><input type="text" name="to${rowCount}" class="to" required></td>
            <td><input type="text" name="total${rowCount}" class="total" readonly></td>
            <td><button type="button" class="removeRow">Видалити</button></td>
        `;
        
        tbody.appendChild(newRow);
        populateLayerSelect(newRow.querySelector('.layer'));
        updateAgeDropdowns();
        addInputHandlers(newRow);
    }

    // Кнопка добавления строки
    const addRowButton = document.getElementById('addRow');
    if (addRowButton) {
        addRowButton.onclick = addNewRow;
    }

    // Добавляем обработчики к существующим строкам
    document.querySelectorAll('#geologyTable tbody tr').forEach(row => {
        addInputHandlers(row);
    });

    // Загрузка индексов при старте
    let ageIndices = JSON.parse(localStorage.getItem('ageIndices') || '[]');

    // Модальное окно для настройки индексов
    const modal = document.getElementById('ageSettingsModal');
    const openModalBtn = document.getElementById('openAgeSettings');
    const closeBtn = document.querySelector('.close');

    // Открытие модального окна
    if (openModalBtn) {
        openModalBtn.onclick = function() {
            modal.style.display = "block";
            renderAgeIndices();
        }
    }

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Закрытие по клику вне окна
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Добавление нового индекса
    const addAgeIndexBtn = document.getElementById('addAgeIndex');
    if (addAgeIndexBtn) {
        addAgeIndexBtn.addEventListener('click', function() {
            const indexInput = document.getElementById('newAgeIndex');
            const nameInput = document.getElementById('newAgeName');
            const index = indexInput.value.trim();
            const name = nameInput.value.trim();
            
            if (index && name) {
                if (!ageIndices.some(item => item.index === index)) {
                    ageIndices.push({ index, name });
                    localStorage.setItem('ageIndices', JSON.stringify(ageIndices));
                    renderAgeIndices();
                    indexInput.value = '';
                    nameInput.value = '';
                    updateAgeDropdowns();
                } else {
                    alert('Такий індекс вже існує!');
                }
            } else {
                alert('Будь ласка, введіть індекс та назву!');
            }
        });
    }

    // Отображение списка индексов
    function renderAgeIndices() {
        const tbody = document.querySelector('#ageIndexTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        ageIndices.forEach((item, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.index}</td>
                <td>${item.name}</td>
                <td>
                    <button type="button" class="deleteAgeIndex" data-index="${i}">Видалити</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Удаление индекса
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('deleteAgeIndex')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            ageIndices.splice(index, 1);
            localStorage.setItem('ageIndices', JSON.stringify(ageIndices));
            renderAgeIndices();
            updateAgeDropdowns();
        }
    });

    // Обновление выпадающих списков возраста
    function updateAgeDropdowns() {
        const ageInputs = document.querySelectorAll('.age');
        ageInputs.forEach(input => {
            const currentValue = input.value;
            const datalist = document.createElement('datalist');
            const datalistId = 'ageList_' + Math.random().toString(36).substr(2, 9);
            datalist.id = datalistId;
            
            ageIndices.forEach(item => {
                const option = document.createElement('option');
                option.value = item.index;
                option.textContent = `${item.index} - ${item.name}`;
                datalist.appendChild(option);
            });
            
            input.setAttribute('list', datalistId);
            const existingDatalist = input.nextElementSibling;
            if (existingDatalist && existingDatalist.tagName === 'DATALIST') {
                existingDatalist.remove();
            }
            input.after(datalist);
            input.value = currentValue;
        });
    }

    // Инициализация индексов при загрузке
    renderAgeIndices();
    updateAgeDropdowns();

    // Удаление слоя
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeRow')) {
            const row = e.target.closest('tr');
            row.remove();
            updateDepth();
        }
    });

    // Добавление событий на изменение значений
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('to') || e.target.classList.contains('from')) {
            calculateTotal();
            updateDepth();
        }
    });

    // Функция для обновления глубины
    function updateDepth() {
        const toInputs = document.querySelectorAll('.to');
        let maxDepth = 0;
        
        toInputs.forEach(input => {
            const value = parseLocalNumber(input.value);
            if (!isNaN(value) && value > maxDepth) {
                maxDepth = value;
            }
        });

        const wellDepthInput = document.getElementById('wellDepth');
        if (wellDepthInput) {
            wellDepthInput.value = formatNumber(maxDepth);
        }
    }

    // Инициализация при загрузке страницы
    function initializeLayerSelects() {
        const selects = document.querySelectorAll('.layer');
        selects.forEach(select => {
            populateLayerSelect(select);
        });
    }

    // Заполнение селекта слоев
    function populateLayerSelect(select) {
        select.innerHTML = '<option value="">Виберіть шар...</option>';
        
        // Добавляем категории и их слои
        for (const [category, layers] of Object.entries(window.geologicalLayers.categories)) {
            const groupElement = document.createElement('optgroup');
            groupElement.label = category;
            
            layers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer;
                option.textContent = layer;
                groupElement.appendChild(option);
            });
            
            select.appendChild(groupElement);
        }
    }

    // Добавление нового слоя
    const addLayerButton = document.getElementById('addLayerButton');
    if (addLayerButton) {
        addLayerButton.addEventListener('click', function() {
            const newLayer = document.getElementById('newLayer').value.trim();
            const category = document.getElementById('layerCategory').value;
            
            if (newLayer && category) {
                if (window.geologicalLayers.addNewLayer(newLayer, category)) {
                    // Обновляем все селекты
                    const selects = document.querySelectorAll('.layer');
                    selects.forEach(select => {
                        const currentValue = select.value;
                        populateLayerSelect(select);
                        select.value = currentValue;
                    });
                    
                    document.getElementById('newLayer').value = '';
                    document.getElementById('layerCategory').value = '';
                    alert('Новий шар додано успішно!');
                } else {
                    alert('Такий шар вже існує!');
                }
            } else {
                alert('Будь ласка, введіть назву шару та виберіть категорію!');
            }
        });
    }

    // Добавление новой колонны
    document.getElementById('addCasingColumn').addEventListener('click', function() {
        const tbody = document.querySelector('#casingColumnsTable tbody');
        const newRow = document.createElement('tr');
        const rowCount = tbody.children.length + 1;
        
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" name="diameter${rowCount}" required></td>
            <td>
                <div class="depth-container">
                    <input type="text" name="depth${rowCount}_from" class="depth-input" required>
                    <span>-</span>
                    <input type="text" name="depth${rowCount}_to" class="depth-input" required>
                </div>
            </td>
            <td><button type="button" class="removeColumn">Видалити</button></td>
        `;
        
        tbody.appendChild(newRow);
        
        // Добавляем форматирование для новых полей глубины
        const depthInputs = newRow.querySelectorAll('.depth-input');
        depthInputs.forEach(input => {
            input.value = '0,0';
            
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d,.-]/g, '');
                this.value = this.value.replace('.', ',');
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.value = '0,0';
                } else {
                    const number = parseLocalNumber(this.value);
                    if (!isNaN(number)) {
                        this.value = formatNumber(number);
                    }
                }
            });
        });
    });

    // Обновление номеров колонн
    function updateColumnNumbers() {
        const rows = document.querySelectorAll('#casingColumnsTable tbody tr');
        rows.forEach((row, index) => {
            row.firstElementChild.textContent = index + 1;
        });
    }

    // Удаление колонны
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeColumn')) {
            const row = e.target.closest('tr');
            row.remove();
            updateColumnNumbers();
        }
    });

    // Функция обновления списка категорий
    function updateCategorySelect() {
        const categorySelect = document.getElementById('layerCategory');
        if (categorySelect) {
            const currentValue = categorySelect.value;
            categorySelect.innerHTML = '<option value="">Виберіть категорію...</option>';
            
            window.geologicalLayers.getCategories().forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
            
            categorySelect.value = currentValue;
        }
    }

    // Добавление новой категории
    const addCategoryButton = document.getElementById('addCategoryButton');
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', function() {
            const newCategory = document.getElementById('newCategory').value.trim();
            
            if (newCategory) {
                if (window.geologicalLayers.addNewCategory(newCategory)) {
                    updateCategorySelect();
                    document.getElementById('newCategory').value = '';
                    alert('Нову категорію додано успішно!');
                } else {
                    alert('Така категорія вже існує!');
                }
            } else {
                alert('Будь ласка, введіть назву категорії!');
            }
        });
    }

    initializeLayerSelects();
    updateCategorySelect();
});
