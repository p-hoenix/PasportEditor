// Категории геологических слоев
const layerCategories = {
'Глини': [
        'Глина',
        'Глина біло-зелена з прошарками піску',
        'Глина жовта',
        'Глина жовта з прошарками піску',
        'Глина жовта щільна',
        'Глина зелена',
        'Глина коричнева',
        'Глина піщана',
        'Глина руда',
        'Глина світло-коричнева',
        'Глина світлосіра в\'язка',
        'Глина сіра',
        'Глина сіра з прошарками каоліну',
        'Глина сіра щільна',
        'Глина сіра щільна з домішками піску',
        'Глина сіро-руда',
        'Глина темно-зелена',
        'Глина темно-коричнева',
        'Глина темно-коричнева, нестійка',
        'Глина темно-сіра',
        'Глина червона',
        'Глина червона з прошарками граніту'
    ],
    'Вапняки': [
        'Вапняк',
        'Вапняк дрібнозернистий',
        'Вапняк крупнозернистий'
    ],
    'Піски': [
        'Пісок',
        'Пісок білий',
        'Пісок жовтий',
        'Пісок дрібнозернистий',
        'Пісок крупнозернистий'
    ],
    'Пісковики': [
        'Пісковик',
        'Пісковик дрібнозернистий',
        'Пісковик з прошарками каоліну',
        'Пісковик крупнозернистий'
    ],
    'Каоліни': [
        'Каолін',
        'Каолін білий',
        'Каолін жовтий',
        'Каолін з прошарками глини',
        'Каолін з прошарками піску',
        'Каолін з прошарками ракушняка'
    ],
    'Суглинки': [
        'Суглинок',
        'Суглинок дрібнозернистий',
        'Суглинок крупнозернистий',
        'Суглинок насипний'
    ],
    'Граніти': [
        'Граніт',
        'Граніт з прошарками піску',
        'Граніт рожевий',
        'Граніт сірий',
        'Граніт сіро-білий',
        'Граніт сіро-жовтий',
        'Граніт червоний',
        'Граніт червоний, рихлий',
        'Граніт червоно-сірий',
        'Сірий камінь'
    ],
    'Жорства': [
        'Жорства',
        'Жорства зцементована'
    ],
    'Особливі зони': [
        'Водоносна тріщина',
        'Карман',
        'Тріщинувата зона',
        'Тріщинувата зона сіро-білий камінь',
        'Чорнозем'
    ]
};

// Получить все слои в виде плоского массива
function getAllLayers() {
    return Object.values(layerCategories).flat();
}

// Получить все категории
function getCategories() {
    return Object.keys(layerCategories);
}

// Добавить новую категорию
function addNewCategory(category) {
    if (!category || layerCategories.hasOwnProperty(category)) {
        return false;
    }
    
    layerCategories[category] = [];
    saveToLocalStorage();
    return true;
}

// Добавить новый слой в соответствующую категорию
function addNewLayer(layer, category) {
    if (!category || !layerCategories.hasOwnProperty(category)) {
        return false;
    }
    
    // Проверяем, существует ли уже такой слой в любой категории
    if (getAllLayers().includes(layer)) {
        return false;
    }
    
    // Добавляем новый слой
    layerCategories[category].push(layer);
    saveToLocalStorage();
    return true;
}

// Сохранение в localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('geologicalLayers', JSON.stringify(layerCategories));
    } catch (e) {
        console.error('Ошибка при сохранении слоев:', e);
    }
}

// Загрузка сохраненных слоев при инициализации
function initializeLayers() {
    try {
        const savedLayers = localStorage.getItem('geologicalLayers');
        if (savedLayers) {
            const parsed = JSON.parse(savedLayers);
            Object.assign(layerCategories, parsed);
        }
    } catch (e) {
        console.error('Ошибка при загрузке слоев:', e);
    }
}

// Инициализируем слои при загрузке скрипта
initializeLayers();

// Экспортируем функции и данные
window.geologicalLayers = {
    categories: layerCategories,
    getAllLayers: getAllLayers,
    getCategories: getCategories,
    addNewLayer: addNewLayer,
    addNewCategory: addNewCategory
};
