// Категории геологических слоев
const layerCategories = {
    'Глини': [
        'Жовта глина',
        'Глина жовта щільна',
        'Глина світлосіра в\'язка',
        'Глина сіра щільна',
        'Глина сіра щільна з домішками піску',
        'Глина піщана',
    ],
    'Пісковики': [
        'Пісковик',
        'Пісковик з прошарками каоліну',
        'Пісковик дрібнозернистий',
        'Пісковик крупнозернистий',
    ],
    'Каоліни': [
        'Каолін',
        'Каолін білий',
        'Каолін жовтий',
    ],
    'Граніти': [
        'Сірий камінь',
        'Граніт',
        'Граніт сірий',
        'Граніт рожевий',
    ],
    'Особливі зони': [
        'Карман',
        'Тріщінувата зона',
        'Тріщінувата зона сіро-білий камінь',
        'Водоносна тріщина',
    ]
};

// Получить все слои в виде плоского массива
function getAllLayers() {
    return Object.values(layerCategories).flat();
}

// Добавить новый слой в соответствующую категорию
function addNewLayer(layer, category = 'Особливі зони') {
    if (layerCategories[category]) {
        if (!layerCategories[category].includes(layer)) {
            layerCategories[category].push(layer);
            return true;
        }
    }
    return false;
}

// Экспортируем функции и данные
window.geologicalLayers = {
    categories: layerCategories,
    getAllLayers,
    addNewLayer
};
