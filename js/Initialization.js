import Helper from './Helper.js';
import State from './State.js';

/**
 * Класс создает игровые поля игроков, где размещает в случайном порядке их корабли.
 */
class Initialization extends Helper {
  constructor() {
    super();
    // id ячеек игрового поля, на которые нельзя размещать новые корабли.
    this.unavailablePlaces = [];
    this.state = new State;
  }

  /**
   * Запускает методы по созданию\пересозданию игровых полей,
   * размещению на них кораблей игроков в случайном порядке.
   */
  battleField() {
    this.deleteBattleField();

    if (this.createBattleField()) {
      this.createNavy();
      this.showCurrentStep();
      this.showCurrentPlayer();
      this.showMessageForUser('turn');
    }
  }

  /**
   * Создает дочерние элементы игровых полей (ячейки), задает им id.
   * @return {boolean} - true в случае успеха.
   */
  createBattleField() {
    const battleFieldSize = this.state.getBattleFieldSize();
    const userBattleFieldIds = [];

    for (let i = 1; i <= 2; i += 1) {
      const battleFiled = this.getBattleField(i);

      if (battleFiled === null) {
        return false;
      }

      for (let r = 1; r <= battleFieldSize; r += 1) {
        for (let c = 1; c <= battleFieldSize; c += 1) {
          const div = document.createElement('div');
          const id = this.frameBattleFieldCoords(i, r, c);

          div.id = id;

          battleFiled.appendChild(div);

          if (i === 2) {
            userBattleFieldIds.push(id);
          }
        }
      }
    }

    this.state.setCompTemplate(userBattleFieldIds);

    return true;
  }

  /**
   * Создает набора кораблей для каждого игрока по определенным параметрам (длина, положение (horizontal/vertical)).
   */
  createNavy() {
    const battleFieldSize = this.state.getBattleFieldSize();

    for (let i = 1; i <= 2; i += 1) {
      const ships = [];

      this.unavailablePlaces = [];

      for (let j = 1; j <= battleFieldSize; j += 1) {
        let shipLength = 0;
        let horizontal = true;

        switch (j) {
          case 1:
            shipLength = 4;
            break;
          case 2:
          case 3:
            shipLength = 3;
            break;
          case 4:
          case 5:
          case 6:
            shipLength = 2;
            break;
          default:
            shipLength = 1;
        }

        if (shipLength > 1) {
          horizontal = !!Math.round(Math.random());
        }

        ships.push(
          this.createShip(i, battleFieldSize, shipLength, horizontal)
        );
      }

      this.state.setPlayerShips(ships, this.getPlayerAlias(i));
    }
  }

  /**
   * Создает корабль согласно его параметрам, размещает в случайном месте на игровом поле игрока.
   * @param {number} battleFieldIndex - индекс игрового поля.
   * @param {number} battleFieldSize - размер стороны игрового поля (в ячейках).
   * @param {number} shipLength - длинна корабля.
   * @param {boolean} horizontal - положение (horizontal/vertical).
   * @return {{Array, sunk: boolean, position: Array}}
   */
  createShip(battleFieldIndex, battleFieldSize, shipLength, horizontal) {
    const limits = {
      horizontal: (horizontal) ? (battleFieldSize - shipLength + 1) : battleFieldSize,
      vertical: (!horizontal) ? (battleFieldSize - shipLength + 1) : battleFieldSize,
    };
    const retryLimit = Math.pow(battleFieldSize, 2);
    const position = [];
    let inaccessiblePlaces = [];
    let successPosition = [];

    for (let i = 1; i < retryLimit; i += 1) {
      /**
       * Определяет возможность размещения корабля в указанные координаты игрового поля.
       * @param {number} n - номер части корабля.
       * @return {boolean} - true если удалось разместить корабль.
       */
      const setShipInPlace = (n = 0) => {
        const row = (horizontal) ? (place.row + n) : place.row;
        const column = (!horizontal) ? (place.column + n) : place.column;
        const battleFieldCoords = this.frameBattleFieldCoords(battleFieldIndex, row, column);
        const element = document.getElementById(battleFieldCoords);

        if (element === null) {
          if (this.state.localEnvironment()) {
            console.error(`ошибка инициализации корабля на игровом поля боя №${battleFieldIndex} (${battleFieldCoords})`);
          }

          return false;
        }

        if (this.unavailablePlaces.indexOf(battleFieldCoords) + 1) {
          return false;
        }

        successPosition.push({
          row,
          column,
          battleFieldCoords,
          element,
        });

        return true;
      };

      const getRowColumn = (limit) =>
        Math.round(Math.random() * (limit - 1)) + 1;
      const place = {
        row: getRowColumn(limits.horizontal),
        column: getRowColumn(limits.vertical),
      };
      let shipHasBeenCreated = true;

      for (let n = 0; n < shipLength; n += 1) {
        if (!setShipInPlace(n)) {
          shipHasBeenCreated = false;
          successPosition = [];
          break;
        }
      }

      if (shipHasBeenCreated) {
        break;
      }
    }

    successPosition.forEach(place => {
      inaccessiblePlaces = Array.prototype.concat(
        inaccessiblePlaces,
        this.getInaccessiblePlaces(
          battleFieldIndex,
          battleFieldSize,
          place.row,
          place.column
        )
      );
      position.push({
        battleFieldCell: place.element,
        damaged: false,
      });

      if (battleFieldIndex === 2) {
        place.element.className = 'battle-field-ship';
      }
    });

    this.unavailablePlaces = Array.prototype.concat(
      this.keepOnlyUniqueElements(
        this.takeOnlyUniqueElements(inaccessiblePlaces),
        this.unavailablePlaces
      ),
      this.unavailablePlaces,
    );

    return {
      sunk: false,
      position,
    };
  }

  /**
   * Удаляет все дочерние элементы игровых полей.
   */
  deleteBattleField() {
    for (let i = 1; i <= 2; i += 1) {
      const battleFiled = this.getBattleField(i);

      if (battleFiled !== null) {
        while (battleFiled.firstChild) {
          battleFiled.removeChild(battleFiled.firstChild);
        }
      }
    }
  }
}

export default Initialization;
