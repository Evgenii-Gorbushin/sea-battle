/**
 * Класс отвечает за манипуляцию с данными хранящимися в объекте seaBattle,
 * который в свою очередь является хранилищем данных приложения.
 */
class State {
  /**
   * Изменяет признак поврежденности для определенной части корабля игрока.
   * @param {string} player - псевдоним игрока.
   * @param {number} shipIndex - индекс корабля в массиве ships.
   * @param {number} positionIndex - индекс позиции в массиве position.
   * @param {boolean} value - true если часть корабля повреждена.
   */
  changeDamagePropertyForShip = (player, shipIndex, positionIndex, value) => {
    window.seaBattle[player].ships[shipIndex].position[positionIndex].damaged = value;
  };

  /**
   * Изменяет признак существования (sunk) для корабля игрока.
   * @param {string} player - псевдоним игрока.
   * @param {number} shipIndex - индекс корабля в массиве ships.
   * @param {boolean} value - true если корабль был потоплен.
   */
  changeSunkPropertyForShip = (player, shipIndex, value) => {
    window.seaBattle[player].ships[shipIndex].sunk = value;
  };

  /**
   * Возвращает true если все части корабля повреждены (damaged = true), иначе false.
   * @param {string} player - псевдоним игрока.
   * @param {number} targetedShipIndex - индекс атакованного корабля соперника в массиве ships.
   * @return {boolean}
   */
  checkShipSank = (player, targetedShipIndex) =>
    window.seaBattle[player].ships[targetedShipIndex].position
      .every(item => item.damaged);

  /**
   * Переопределяет объект target,
   * который хранит данные о ячейке выбранной игроком для совершения хода.
   */
  clearPlayerTarget = () => {
    window.seaBattle.target = {
      reference: null,
      color: '',
    };
  };

  /**
   * Инициализация объекта seaBattle.
   */
  create = () => {
    window.seaBattle = {
      BATTLE_FIELD_SIZE: 10,
      ENVIRONMENT: 'production', // local production
      currentStep: 1,
      currentTurn: 'user',
      stepIsExecuting: false,
      target: {
        reference: null,
        color: '',
      },
      user: {
        name: '',
        ships: [],
      },
      comp: {
        shipUnderAttack: [],
        template: [],
        ships: [],
      },
      steps: {
        user: [],
        comp: [],
      },
      history: {
        currentRecord: null,
        previousRecord: null,
      },
    };
  };

  /**
   * Очищает массив хранящий данные об id ячейках, которые занимает поврежденный корабль противника.
   */
  clearShipUnderAttack = () => {
    window.seaBattle.comp.shipUnderAttack = [];
  };

  /**
   * Возвращает true если все корабли противника были потоплены.
   * @param {string} player - псевдоним игрока.
   * @return {boolean}
   */
  gameIsOver = (player) =>
    window.seaBattle[player].ships
      .every(ship => ship.sunk);

  /**
   * Возвращает размер стороны игрового поля (в ячейках).
   * @return {number}
   */
  getBattleFieldSize = () =>
    window.seaBattle.BATTLE_FIELD_SIZE;

  /**
   * Возвращает массив состоящий из id всех ячеек игрового поля пользователя.
   */
  getCompTemplate = () =>
    [...window.seaBattle.comp.template];

  /**
   * Возвращает номер текущего хода.
   * @return {number}
   */
  getCurrentStep = () =>
    window.seaBattle.currentStep;

  /**
   * Возвращает псевдоним игрока совершающего ход в игре.
   * @return {string}
   */
  getCurrentTurn = () =>
    window.seaBattle.currentTurn;

  /**
   * Возвращает значение свойства объекта history, имя свойства определяется параметром propertyName.
   * @param {string} propertyName - имя свойства объекта history.
   * @return {null|HTMLLIElement}
   */
  getHistory = (propertyName) =>
    window.seaBattle.history[propertyName];

  /**
   * Возвращает информацию о кораблях игрока.
   * @param {string} player - псевдоним игрока.
   * @return {{sunk: boolean, position: {battleFieldCell: HTMLDivElement, damaged: boolean}[]}[]}
   */
  getPlayerShips(player) {
    return this.getShipsDeepCopy(
      window.seaBattle[player].ships
    );
  }

  /**
   * Возвращает данные о ячейке выбранной игроком для совершения хода.
   * @return {Object}
   */
  getPlayerTarget = () =>
    Object.assign({}, window.seaBattle.target);

  /**
   * Возвращает массив ссылок на ячейки, которые занимает корабль.
   * @param {string} player - псевдоним игрока.
   * @param {number} shipIndex - индекс атакованного корабля соперника в массиве ships.
   * @return {Array}
   */
  getShip = (player, shipIndex) =>
    window.seaBattle[player].ships[shipIndex].position
      .map(place => place.battleFieldCell);

  /**
   * Возвращает массив состоящий из id ячейек, на которых находится атакованные части корабля противника.
   * @return {Array}
   */
  getShipUnderAttack = () =>
    [ ...window.seaBattle.comp.shipUnderAttack ];

  /**
   * Возвращает глубокую копию массива.
   * @param {Array} ships
   * @return {{position: {battleFieldCell: HTMLDivElement, damaged: boolean}[], sunk: boolean}[]}
   */
  getShipsDeepCopy = (ships) =>
    ships.map(ship => ({
      position: ship.position.map(item => ({
        battleFieldCell: item.battleFieldCell,
        damaged: item.damaged,
      })),
      sunk: ship.sunk,
    }));

  /**
   * Возвращает значение свойства stepIsExecuting.
   * @return {boolean}
   */
  getStepIsExecuting = () =>
    window.seaBattle.stepIsExecuting;

  /**
   * Возвращает массив из id ячеек (которые были ранее атакованы игроком,
   * а также всех ячейек по периметру потопленных им кораблей).
   * @param {string} player - псевдоним игрока.
   * @return {Array}
   */
  getTargetedPlaces = (player) => [
    ...window.seaBattle.steps[player],
  ];

  /**
   * Возвращает имя указанное пользователем.
   * @return {string}
   */
  getUserName = () =>
    window.seaBattle.user.name;

  /**
   * Увеличивает на 1 величину переменной currentStep.
   */
  increaseCurrentStep = () => {
    window.seaBattle.currentStep += 1;
  };

  /**
   * Возвращает true если текущее окружение определено как локальное.
   * @return {boolean}
   */
  localEnvironment = () =>
    (window.seaBattle.ENVIRONMENT === 'local');

  /**
   * Определяет, содержится ли id ячейки (атакованной игроком) в соответствующем данному игроку массиве (user/comp).
   * @param {string} player - псевдоним игрока.
   * @param {string} id - ячейки атакованной игроком.
   * @return {boolean}
   */
  placeWasTargeted = (player, id) =>
    !!(window.seaBattle.steps[player].indexOf(id) + 1);

  /**
   * Сохраняет массив состоящий из id всех ячеек игрового поля пользователя.
   * @param {Array} userBattleFieldIds
   */
  setCompTemplate = (userBattleFieldIds) => {
    window.seaBattle.comp.template = [...userBattleFieldIds];
  };

  /**
   * Сохраняет псевдоним игрока совершающего ход в игре.
   * @param {string} nextTurn
   */
  setCurrentTurn = nextTurn => {
    window.seaBattle.currentTurn = nextTurn;
  };

  /**
   * Изменяет значение свойства объекта history, имя свойства определяется параметром propertyName.
   * @param {string} propertyName - имя свойства объекта history.
   * @param {HTMLLIElement} record - запись раздела истории.
   */
  setHistory = (propertyName, record) => {
    window.seaBattle.history[propertyName] = record;
  };

  /**
   * Сохраняет в информацию о кораблях игрока.
   * @param {Array} ships - содержит данные о кораблях игрока.
   * @param {string} player - псевдоним игрока.
   */
  setPlayerShips(ships, player) {
    window.seaBattle[player].ships = this.getShipsDeepCopy(ships);
  }

  /**
   * Сохраняет данные о ячейке выбранной игроком для совершения хода.
   * @param {HTMLElement} target.
   */
  setPlayerTarget = target => {
    window.seaBattle.target = {
      reference: target,
      color: (target === null) ? '' : target.style.backgroundColor,
    };
  };

  /**
   * Добавляет в массив id ячейки, на которой находится атакованная часть корабля противника.
   */
  setShipUnderAttack = () => {
    window.seaBattle.comp.shipUnderAttack = [
      ...window.seaBattle.comp.shipUnderAttack,
      this.getPlayerTarget().reference.id,
    ];
  };

  /**
   * Изменяет значение свойства stepIsExecuting.
   * @param {boolean} bool
   */
  setStepIsExecuting = bool => {
    window.seaBattle.stepIsExecuting = bool;
  };

  /**
   * Сохраняет id ячеек (ячейки атакованные игроком, а также всех ячейек по периметру потопленный кораблей противника)
   * в соответствующем игроку массиве (user/comp).
   * @param {string} player - псевдоним игрока.
   * @param {Array} targetedPlacesIds - id ячеек.
   */
  setTargetedPlaces = (player, targetedPlacesIds) => {
    window.seaBattle.steps[player] = [
      ...window.seaBattle.steps[player],
      ...targetedPlacesIds,
    ];
  };

  /**
   * Сохраняет имя пользователя.
   * @param {string} userName
   */
  storeUserName = userName => {
    window.seaBattle.user.name = userName;
  };
}

export default State;
