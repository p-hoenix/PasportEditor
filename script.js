document.addEventListener('DOMContentLoaded', function() { 
    // Инициализация EmailJS с вашим пользовательским ID
    emailjs.init("ZfW0i6YU3Jj566Dql");
    
    console.log('DOM загружен');
    
    const depthInput = document.getElementById('wellDepth'); // Поле "Глибина свердловини"
    console.log('Найдено поле глубины:', depthInput);

    const form = document.getElementById('geologyForm');
    console.log('Найдена форма:', form);

    // Инициализируем селекты при загрузке страницы
    initializeLayerSelects();

    // Инициализируем первую строку
    const firstRow = document.querySelector('#geologyTable tbody tr');
    if (firstRow) {
        const fromInput = firstRow.querySelector('.from');
        const toInput = firstRow.querySelector('.to');
        if (fromInput) {
            fromInput.value = "0,0";
            fromInput.type = "text";
        }
        if (toInput) {
            toInput.type = "text";
        }
    }

    if (form) {
        form.addEventListener('submit', function(event) {
            console.log('Форма отправляется');
            event.preventDefault();  // Предотвращаем стандартное поведение (перезагрузку страницы)

            // Собираем данные с формы
            const layers = [];
            document.querySelectorAll('#geologyTable tbody tr').forEach(function(row) {
                const layer = row.querySelector('select').value;  // Для выбора слоя
                const from = row.querySelector('.from').value;    // Для от
                const to = row.querySelector('.to').value;        // Для до
                const total = row.querySelector('.total').value;  // Для всего

                console.log('Обработка слоя:', { layer, from, to, total });

                // Добавляем слой в массив только если есть все данные
                if (layer && from && to) {
                    layers.push({
                        layer: layer,
                        from: from,
                        to: to,
                        total: total
                    });
                }
            });

            console.log('Собранные слои:', layers);

            // Преобразуем массив слоев в HTML таблицу
            const layersString = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Шар</th>
                        <th style="padding: 8px; text-align: center;">Від (м)</th>
                        <th style="padding: 8px; text-align: center;">До (м)</th>
                        <th style="padding: 8px; text-align: center;">Всього (м)</th>
                    </tr>
                    ${layers.map(l => 
                        `<tr>
                            <td style="padding: 8px;">${l.layer}</td>
                            <td style="padding: 8px; text-align: center;">${l.from}</td>
                            <td style="padding: 8px; text-align: center;">${l.to}</td>
                            <td style="padding: 8px; text-align: center;">${l.total}</td>
                        </tr>`
                    ).join('')}
                </table>
            `;

            // Собираем данные об обсадных трубах
            const casingColumns = [];
            document.querySelectorAll('#casingColumnsTable tbody tr').forEach(function(row, index) {
                const diameter = row.querySelector('input[name^="diameter"]').value;
                const depth = row.querySelector('input[name^="depth"]').value;
                if (diameter && depth) {
                    casingColumns.push({
                        number: index + 1,
                        diameter: diameter,
                        depth: depth
                    });
                }
            });

            // Преобразуем массив обсадных труб в HTML таблицу
            const casingColumnsString = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Номер</th>
                        <th style="padding: 8px; text-align: center;">Діаметр (мм)</th>
                        <th style="padding: 8px; text-align: center;">Глибина (м)</th>
                    </tr>
                    ${casingColumns.map(c => 
                        `<tr>
                            <td style="padding: 8px;">${c.number}</td>
                            <td style="padding: 8px; text-align: center;">${c.diameter}</td>
                            <td style="padding: 8px; text-align: center;">${c.depth}</td>
                        </tr>`
                    ).join('')}
                </table>
            `;

            const data = {
                to_email: 'ckopoxod96@gmail.com',
                absoluteMark: document.getElementById('absoluteMark').value || '',
                wellDepth: document.getElementById('wellDepth').value || '',
                layers: layersString,
                casingColumns: casingColumnsString,
                staticLevel: document.getElementById('staticLevel').value || '',
                dynamicLevel: document.getElementById('dynamicLevel').value || '',
                wellDebits: document.getElementById('wellDebits').value || '',
                comments: document.getElementById('comments').value || '',
                position: document.getElementById('position').value || '',
                fullName: document.getElementById('fullName').value || ''
            };

            console.log('Финальные данные для отправки:', JSON.stringify(data, null, 2));

            // Проверяем каждое поле перед отправкой
            Object.entries(data).forEach(([key, value]) => {
                console.log(`${key}:`, typeof value, '=', value);
                if (value === undefined || value === null) {
                    console.error(`Поле ${key} имеет недопустимое значение:`, value);
                }
            });

            // Показываем индикатор загрузки или блокируем кнопку
            const submitButton = document.getElementById('submitForm');
            submitButton.disabled = true;
            submitButton.textContent = 'Відправка...';

            // Отправляем данные через EmailJS
            emailjs.send('service_hnizmjj', 'template_rgbcnbz', data)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Форма успішно відправлена!');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Надіслати';
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Помилка при відправці форми: ' + error.text);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Надіслати';
                });
        });
    }

    // Инициализация селектов при загрузке страницы
    function initializeLayerSelects() {
        const selects = document.querySelectorAll('.layer');
        selects.forEach(select => {
            populateLayerSelect(select);
        });
    }

    // Заполнение селекта слоев
    function populateLayerSelect(select) {
        select.innerHTML = '<option value="">Виберіть слой...</option>';
        
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
    document.getElementById('addLayerButton').addEventListener('click', function() {
        const newLayer = document.getElementById('newLayer').value.trim();
        const category = document.getElementById('layerCategory').value;
        
        if (newLayer) {
            if (window.geologicalLayers.addNewLayer(newLayer, category)) {
                // Обновляем все селекты
                const selects = document.querySelectorAll('.layer');
                selects.forEach(select => {
                    const currentValue = select.value; // Сохраняем текущее значение
                    populateLayerSelect(select);
                    select.value = currentValue; // Восстанавливаем значение
                });
                
                document.getElementById('newLayer').value = ''; // Очищаем поле ввода
                alert('Новий шар додано успішно!');
            } else {
                alert('Такий шар вже існує!');
            }
        } else {
            alert('Введіть назву шару!');
        }
    });

    // Функция для форматирования числа в формат 0,0
    function formatNumber(num) {
        return Number(num).toLocaleString('uk-UA', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
            useGrouping: false
        }).replace('.', ',');
    }

    // Функция для преобразования строки с запятой в число
    function parseLocalNumber(str) {
        return parseFloat(str.replace(',', '.')) || 0;
    }

    // Функция для вычисления "Всього"
    function calculateTotal() {
        document.querySelectorAll('#geologyTable tbody tr').forEach(row => {
            const fromInput = row.querySelector('.from');
            const toInput = row.querySelector('.to');
            const totalInput = row.querySelector('.total');

            if (fromInput && toInput && totalInput) {
                const from = parseLocalNumber(fromInput.value);
                const to = parseLocalNumber(toInput.value);
                const total = to - from;
                
                // Форматируем значение
                totalInput.value = formatNumber(total);
            }
        });
        updateDepth();
    }

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
        wellDepthInput.value = maxDepth.toFixed(1);
    }

    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('to')) {
            updateDepth();
        }
    });

    // Добавление новой строки для геологического слоя
    document.getElementById('addRow').addEventListener('click', function() {
        const tbody = document.querySelector('#geologyTable tbody');
        const newRow = document.createElement('tr');
        const rowCount = tbody.children.length + 1;
        
        // Получаем значение "До" из последней строки или 0,0 если это первая строка
        let lastToValue = "0,0";
        if (tbody.children.length > 0) {
            const lastRow = tbody.children[tbody.children.length - 1];
            const lastToInput = lastRow.querySelector('.to');
            if (lastToInput && lastToInput.value) {
                lastToValue = lastToInput.value;
            }
        }
        
        newRow.innerHTML = `
            <td>
                <select name="layer${rowCount}" class="layer layer-select" required>
                    <option value="">Виберіть слой...</option>
                </select>
            </td>
            <td><input type="text" name="from${rowCount}" class="from" required value="${lastToValue}"></td>
            <td><input type="text" name="to${rowCount}" class="to" required></td>
            <td><input type="text" name="total${rowCount}" class="total" required readonly></td>
            <td><button type="button" class="removeRow">Видалити</button></td>
        `;
        
        tbody.appendChild(newRow);
        populateLayerSelect(newRow.querySelector('.layer'));
        
        // Добавляем обработчики для форматирования при вводе
        const fromInput = newRow.querySelector('.from');
        const toInput = newRow.querySelector('.to');
        
        fromInput.addEventListener('blur', function() {
            this.value = formatNumber(parseLocalNumber(this.value));
            calculateTotal();
        });
        
        toInput.addEventListener('blur', function() {
            this.value = formatNumber(parseLocalNumber(this.value));
            calculateTotal();
        });
    });

    // Добавляем обработчики для существующих полей
    document.querySelectorAll('.from, .to').forEach(input => {
        input.addEventListener('blur', function() {
            this.value = formatNumber(parseLocalNumber(this.value));
            calculateTotal();
        });
    });

    // Удаление слоя
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeRow')) {
            const row = e.target.closest('tr');
            row.remove();
            updateDepth(); // Пересчёт глубины после удаления строки
        }
    });

    // Добавление событий на изменение значений
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('to') || e.target.classList.contains('from')) {
            calculateTotal();
            updateDepth(); // Обновляем глубину при каждом изменении "До" или "Від"
        }
    });

    // Функция для добавления новой колонны в таблицу
    document.getElementById('addCasingColumn').addEventListener('click', function() {
        const tableBody = document.querySelector('#casingColumnsTable tbody');
        const newRow = document.createElement('tr');
        const rowCount = tableBody.rows.length + 1;

        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="number" name="diameter${rowCount}" required></td>
            <td><input type="number" name="depth${rowCount}" required></td>
            <td><button type="button" class="removeColumn">Видалити</button></td>
        `;
        tableBody.appendChild(newRow);

        // Применяем обработчик для удаления новой колонны
        newRow.querySelector('.removeColumn').addEventListener('click', function() {
            newRow.remove();
        });
    });

    // Функция для добавления форматирования к полю
    function addNumberFormatting(inputElement) {
        inputElement.value = '0,0';
        
        // Обработка ввода для фильтрации символов
        inputElement.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d,.-]/g, '');
            value = value.replace('.', ',');
            e.target.value = value;
        });

        // Форматирование при потере фокуса
        inputElement.addEventListener('blur', function(e) {
            let value = e.target.value;
            if (!value) {
                e.target.value = '0,0';
            } else {
                const number = parseLocalNumber(value);
                if (!isNaN(number)) {
                    e.target.value = formatNumber(number);
                }
            }
        });

        // Форматирование при нажатии Enter
        inputElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                let value = e.target.value;
                if (!value) {
                    e.target.value = '0,0';
                } else {
                    const number = parseLocalNumber(value);
                    if (!isNaN(number)) {
                        e.target.value = formatNumber(number);
                    }
                }
                e.target.blur(); // Убираем фокус с поля
            }
        });
    }

    // Форматирование числовых полей
    const numberFields = [
        'absoluteMark',
        'staticLevel',
        'dynamicLevel',
        'wellDebits'
    ];

    numberFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            addNumberFormatting(input);
        }
    });
});
