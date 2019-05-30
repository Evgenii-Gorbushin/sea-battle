import State from './State.js';

/**
 * Класс состоит из методов для обработки небольших, разноплановых задач.
 */
class Helper {
  constructor() {
    this.state = new State;
  }

  /**
   * Обеспечивает задержку на указанное временя в милисекундах.
   * @param {number} ms
   * @return {Promise<boolean>}
   */
  delay = (ms) =>
    new Promise(resolve =>
      setTimeout(() => resolve(true), ms)
    );

  /**
   * Делает поле ввода (имени пользователя) неактивным, отключает стили border.
   * @param {string} id - поля ввода имени пользователя.
   */
  disableInput = (id) => {
    const userNameInput = document.getElementById(id);

    userNameInput.setAttribute('disabled', 'true');
    userNameInput.style.border = 'none';
  };

  /**
   * Формирует id дочернего элемента игрового поля.
   * @param {number} field - индекс игрового поля.
   * @param {number} row - положение элемента по оси Х.
   * @param {number} column - положение элемента по оси У.
   * @return {string}
   */
  frameBattleFieldCoords = (field, row, column) =>
    `field${field}row${row}column${column}`;

  /**
   * Получает HTMLElement по его id, в зависимости от индекса игрового поля.
   * @param {number} index - индекс игрового поля.
   * @return {HTMLElement}
   */
  getBattleField = (index) => {
    const id = `battle-field-${index}`;
    const battleFiled = document.getElementById(id);

    if (battleFiled === null) {
      if (this.state.localEnvironment()) {
        console.error(`ошибка инициализации игрового поля боя №${index} (${id})`);
      }
    }

    return battleFiled;
  };

  /**
   * Возвращает индекс игрового поля.
   * @param {string} currentTurn - псевдоним игрока.
   * @return {number}
   */
  getBattleFieldIndex = (currentTurn) =>
    (currentTurn === 'user') ? 1 : 2;

  /**
   * Извлекает номер колонки из id ячейки.
   * @param {string} id - ячейки на игровом поле боя.
   * @return {number}
   */
  getColumn = (id) =>
    parseInt(
      id.split('')
        .splice(id.indexOf('column') + 6)
        .join(''),
      10
    );

  /**
   * Вычисляет id всех элементов, которые примыкают к указанным координатам row/column по периметру.
   * @param {number} battleFieldIndex - индекс игрового поля.
   * @param {number} battleFieldSize - размер стороны игрового поля (в ячейках).
   * @param {number} row - положение элемента по оси Х.
   * @param {number} column - положение элемента по оси У.
   * @param {number} length - количество возвращаемых ячеек (8/4).
   * @return {Array} - id ячеек игрового поля.
   */
  getInaccessiblePlaces(battleFieldIndex, battleFieldSize, row, column, length = 8) {
    const inaccessiblePlaces = [];

    for (let i = 1; i <= length; i += 1) {
      let newRow = row;
      let newColumn = column;

      switch (i) {
        case 1:
          newColumn += 1;
          break;
        case 2:
          newColumn -= 1;
          break;
        case 3:
          newRow += 1;
          break;
        case 4:
          newRow -= 1;
          break;
        case 5:
          newRow += 1;
          newColumn += 1;
          break;
        case 6:
          newRow -= 1;
          newColumn -= 1;
          break;
        case 7:
          newRow += 1;
          newColumn -= 1;
          break;
        case 8:
          newRow -= 1;
          newColumn += 1;
          break;
        default:
      }

      if (
        (newRow > 0 && newRow <= battleFieldSize)
        &&
        (newColumn > 0 && newColumn <= battleFieldSize)
      ) {
        inaccessiblePlaces.push(
          this.frameBattleFieldCoords(battleFieldIndex, newRow, newColumn)
        );
      }
    }

    return inaccessiblePlaces;
  }

  /**
   * Определяет имя игрока по его псевдониму.
   * @param {string} alias - псевдоним игрока.
   * @return {string}
   */
  getNameOfPlayer(alias) {
    return (alias === 'user')
      ? this.state.getUserName()
      : 'computer';
  }

  /**
   * Возвращает псевдоним игрока ожидающего своей очереди на ход.
   * @param {string} currentPlayer - псевдоним игрока выполняющего ход.
   * @return {string}
   */
  getOpponent = (currentPlayer) =>
    (currentPlayer === 'user') ? 'comp' : 'user';

  /**
   * Определяет псевдоним игрока по индексу игрового поля, где 1 - компьютер, 2 - пользователь.
   * @param {number} i - индекс игрового поля.
   * @return {string}
   */
  getPlayerAlias = (i) =>
    (i === 1) ? 'comp' : 'user';

  /**
   * Извлекает номер рядя из id ячейки.
   * @param {string} id - ячейки на игровом поле боя.
   * @return {number}
   */
  getRow = (id) => {
    const start = id.indexOf('row') + 3;
    const end = id.indexOf('column') - 1;

    return parseInt(
      id.split('')
        .splice(start, (end - start + 1))
        .join(''),
      10
    );
  };

  /**
   * Возвращает массив состоящий только из тех элементов массива source, которых нет в массиве comparison.
   * @param {Array} source
   * @param {Array} comparison
   * @return {Array|void}
   */
  keepOnlyUniqueElements(source, comparison) {
    return source.filter(item =>
      (comparison.indexOf(item) === -1)
    );
  }

  /**
   * В зависимости от значения параметра action делает кнопку disabled/enabled,
   * также меняет ее стили для лучшего восприятия состояния кнопки пользователем.
   * @param {string} action - принимает значения disabled/enabled.
   * @param {string} id - кнопки.
   */
  manageButton = (action, id) => {
    const button = document.getElementById(id);

    if (action === 'disable') {
      button.setAttribute('disabled', 'true');
      button.style.cssText = `
        background-color: lightgrey;
        cursor: default;
        color: white;
      `;
    }
  };

  /**
   * Сохраняет ссылку на ячейку выбранную игроком для совершения хода,
   * при этом предыдущая ячейка приводится в прежний вид.
   * @param {HTMLElement} currentTarget
   */
  setPlayerTarget(currentTarget) {
    const previousTarget = this.state.getPlayerTarget();

    if (previousTarget.reference !== currentTarget) {
      if (previousTarget.reference !== null) {
        previousTarget.reference.style.backgroundColor = previousTarget.color;
      }

      this.state.setPlayerTarget(currentTarget);
      currentTarget.style.backgroundColor = 'steelblue';
    } else {
      previousTarget.reference.style.backgroundColor = '';
      this.state.setPlayerTarget(null);
    }
  }

  /**
   * Выводит на экран имя игрока совершающего ход.
   */
  showCurrentPlayer() {
    const playerName = this.getNameOfPlayer(
      this.state.getCurrentTurn()
    );

    document.getElementById('whose-turn')
      .innerText = (playerName === '') ? '' : ` (${playerName})`;
  }

  /**
   * Выводит на экран номера текущего хода.
   */
  showCurrentStep = () => {
    document.getElementById('current-step')
      .innerText = this.state.getCurrentStep().toString();
  };

  /**
   * Выводит сообщение для пользователя (левый верхний угол),
   * содержание которого формируется в зависимости от значения параметра type.
   * @param {string} type
   */
  showMessageForUser = (type) => {
    const currentTurn = this.state.getCurrentTurn();
    const messageBox = document.getElementById('message-box');
    let message = '';

    switch (type) {
      case 'turn':
        message = (currentTurn === 'comp') ? 'Ход компьютера' : 'Ваш ход';
        break;
      case 'win':
        message = (currentTurn === 'comp') ? 'Вы проиграли' : 'Вы победили!';
        break;
      case 'clear':
        break;
      default:
        if (this.state.localEnvironment()) {
          console.error(`неожиданное значение параметра type = ${type}`);
        }
    }

    messageBox.innerText = message;
    messageBox.style.color = (currentTurn === 'comp')
      ? (type === 'win') ? 'red' : 'gray'
      : (type === 'win') ? 'blue' : 'green';
  };

  /**
   * Возвращает массив состоящий только из уникальных элементов массива source.
   * @param {Array} source
   * @return {Array}
   */
  takeOnlyUniqueElements(source) {
    const uniqueArray = [];

    source.forEach(item => {
      if (uniqueArray.indexOf(item) === -1) {
        uniqueArray.push(item);
      }
    });

    return uniqueArray;
  }

  /**
   * Определяет ввел ли пользователь имя в соответствующее поле.
   * @return {boolean}
   */
  verifyUserName() {
    return (this.state.getUserName() !== '');
  }
}

export default Helper;
