import Helper from './Helper.js';
import State from './State.js';

/**
 * Реализовывает ход игрока, совершая манипуляции с данными и интерфейсом.
 */
class Step extends Helper {
  constructor() {
    super();
    this.state = new State;
  }

  /**
   * Реализация хода компьютера. Варианты поведения компьютера:
   * 1. Если существует корабль противника подбитый, но не потопленный,
   * то атака ведется вокруг тех ячейек, где были успешные попадания по этому кораблю.
   * 2. Иначе рандомно выбирается ячейка, по которой атака еще не проводилась.
   */
  async computerMakesStep() {
    const currentTurn = this.state.getCurrentTurn();
    const targetedPlaces = this.state.getTargetedPlaces(currentTurn);
    const shipUnderAttack = this.state.getShipUnderAttack();
    const shipUnderAttackLength = shipUnderAttack.length;
    const battleFieldIndex = this.getBattleFieldIndex(currentTurn);
    const battleFieldSize = this.state.getBattleFieldSize();
    let userBattleFieldIds = (shipUnderAttackLength === 0)
      ? this.state.getCompTemplate()
      : this.getInaccessiblePlaces(
        battleFieldIndex,
        battleFieldSize,
        this.getRow(shipUnderAttack[shipUnderAttackLength - 1]),
        this.getColumn(shipUnderAttack[shipUnderAttackLength - 1]),
        4
      );
    let possibleCoords = this.keepOnlyUniqueElements(userBattleFieldIds, targetedPlaces);

    if ((shipUnderAttackLength > 0) && (possibleCoords.length === 0)) {
      userBattleFieldIds = this.getInaccessiblePlaces(
        battleFieldIndex,
        battleFieldSize,
        this.getRow(shipUnderAttack[0]),
        this.getColumn(shipUnderAttack[0]),
        4
      );
      possibleCoords = this.keepOnlyUniqueElements(userBattleFieldIds, targetedPlaces);
    }

    const target = possibleCoords[
      Math.round(
        Math.random() * (possibleCoords.length - 1)
      )
    ];

    if (await this.delay(750)) {
      this.setPlayerTarget(
        document.getElementById(target)
      );

      if (await this.delay(250)) {
        this.implementStep();
      }
    }
  }

  /**
   * Формирует запись для раздела истории.
   * @param {string} type - тип записи, которую необходимо сформировать.
   * @return {string}
   */
  frameHistoryRecord = (type) => {
    const historyList = document.getElementById('history-list');
    const record = document.createElement('li');
    const data = {
      text: '',
      address: '',
      playerName: '',
      currentStep: null,
    };

    switch (type) {
      case 'step':
        data.address = this.state.getPlayerTarget().reference.id
          .replace('field1', '')
          .replace('field2', '')
          .replace('row', 'ряд:')
          .replace('column', ' колонка:');
        data.playerName = this.getNameOfPlayer(
          this.state.getCurrentTurn()
        );
        data.currentStep = this.state.getCurrentStep();
        data.text = `<div class="record-number">${data.currentStep}.</div>
          <div>Игрок <b>${data.playerName}</b> совершил(а) ход (${data.address})</div>`;
        break;
      case 'damaged':
        data.text = '<div class="record-damaged">корабль противника получил повреждения</div>';
        break;
      case 'sunk':
        data.text = '<div class="record-sunk">и затонул</div>';
        break;
      case 'win':
        data.playerName = this.getNameOfPlayer(
          this.state.getCurrentTurn()
        );
        data.text = `<div class="record-win">Игра окончена! Победил игрок <b>${data.playerName}</b></div>`;
        break;
      default:
        if (this.state.localEnvironment()) {
          console.error(`неожиданное значение параметра type = ${type}`);
        }
    }

    record.innerHTML = data.text;

    if (type === 'step' || type === 'win') {
      historyList.insertBefore(
        record,
        this.state.getHistory('currentRecord')
      );
      this.state.setHistory(
        'previousRecord',
        this.state.getHistory('currentRecord')
      );
      this.state.setHistory('currentRecord', record);
    } else {
      historyList.insertBefore(
        record,
        this.state.getHistory('previousRecord')
      );
    }
  };

  /**
   * Если условия для победы игрока были выполнены, то:
   * соответствующее сообщения выводится пользователю,
   * блокируются элементы управления позволяющие совершить следующий ход.
   * @return {boolean}
   */
  gameHasBeenFinished() {
    const gameIsOver = this.state.gameIsOver(
      this.getOpponent(
        this.state.getCurrentTurn()
      )
    );

    if (gameIsOver) {
      document.getElementById('battle-field-1')
        .removeEventListener('click', window.gl.fun.clickOnBattleField);

      this.manageButton('disable', 'make-step');
      this.frameHistoryRecord('win');
      this.showMessageForUser('win');
    }

    return gameIsOver;
  }

  /**
   * Выполняет цепочку последовательных действий, тем самым реализуя ход игрока.
   */
  async implementStep() {
    this.showMessageForUser('clear');
    this.frameHistoryRecord('step');
    this.updateStepsSummary();

    const targetedShipIndex = this.shipHasBeenTargeted();

    if (targetedShipIndex !== false) {
      if (this.shipHasBeenSunk(targetedShipIndex)) {
        if (this.gameHasBeenFinished()) {
          return false;
        }
      }
    } else {
      this.markTargetedPlaces([
        this.state.getPlayerTarget().reference,
      ]);
      this.state.setTargetedPlaces(
        this.state.getCurrentTurn(),
        [this.state.getPlayerTarget().reference.id]
      );
      this.setPlayerTarget(
        this.state.getPlayerTarget().reference
      );
      this.state.setCurrentTurn(
        this.getOpponent(
          this.state.getCurrentTurn()
        )
      );
      this.showCurrentPlayer();
    }

    this.state.increaseCurrentStep();
    this.showCurrentStep();
    this.showMessageForUser('turn');

    if (this.state.localEnvironment()) {
      console.log(window.seaBattle);
    }

    if (this.state.getCurrentTurn() === 'comp') {
      await this.computerMakesStep();
    }
  }

  /**
   * Помечает с помощью буквы ячейку, которая была атакована игроком,
   * а также все ячейки по периметру потопленного корабля противника.
   * @param {Array} targetedPlaces - ссылки на ячейки.
   */
  markTargetedPlaces = (targetedPlaces) =>
    targetedPlaces.forEach(place => {
      place.innerText = 'x';
    });

  /**
   * В случае если все части атакованного корабля соперника повреждены:
   * помечает корабль как потопленный,
   * создает соответствующую запись в раздел истории.
   * @param {number} targetedShipIndex - индекс атакованного корабля соперника в массиве ships.
   * @return {boolean}
   */
  shipHasBeenSunk(targetedShipIndex) {
    const currentTurn = this.state.getCurrentTurn();
    const opponent = this.getOpponent(currentTurn);
    const shipSank = this.state.checkShipSank(opponent, targetedShipIndex);

    if (shipSank) {
      const inaccessiblePlaces = [];
      const battleFieldSize = this.state.getBattleFieldSize();
      const battleFieldIndex = this.getBattleFieldIndex(currentTurn);
      const ship = this.state.getShip(opponent, targetedShipIndex);
      const shipCoords = ship.map(part => ({
        row: this.getRow(part.id),
        column: this.getColumn(part.id),
      }));

      shipCoords.forEach(coords => inaccessiblePlaces.push(
        ...this.getInaccessiblePlaces(
          battleFieldIndex,
          battleFieldSize,
          coords.row,
          coords.column
        )
      ));

      const coordsAroundShip = this.keepOnlyUniqueElements(
        this.takeOnlyUniqueElements(inaccessiblePlaces),
        this.state.getTargetedPlaces(currentTurn)
      );

      this.state.changeSunkPropertyForShip(opponent, targetedShipIndex, true);
      this.state.setTargetedPlaces(currentTurn, coordsAroundShip);
      this.markTargetedPlaces(
        coordsAroundShip.map(coord =>
          document.getElementById(coord)
        )
      );
      this.frameHistoryRecord('sunk');

      if (currentTurn === 'user') {
        this.updateProgress(ship.length);
      } else {
        this.state.clearShipUnderAttack();
      }
    }

    return shipSank;
  }

  /**
   * Определят находился ли корабль противника в ячейке атакованной игроком,
   * возвращает: false если нет, индекс корабля противника (его индекс в массиве ships) если да.
   * @return {number|boolean}
   */
  shipHasBeenTargeted() {
    const userTarget = this.state.getPlayerTarget();
    const currentTurn = this.state.getCurrentTurn();
    const ships = this.state.getPlayerShips(
      this.getOpponent(currentTurn)
    );
    let result = false;

    ships.forEach((ship, shipIndex) => {
      if (!ship.sunk) {
        ship.position.forEach((item, positionIndex) => {
          if (item.battleFieldCell === userTarget.reference) {
            result = shipIndex;
            item.battleFieldCell.style.backgroundColor = 'red';

            this.state.changeDamagePropertyForShip(
              this.getOpponent(currentTurn),
              shipIndex,
              positionIndex,
              true
            );
            this.frameHistoryRecord('damaged');
            this.markTargetedPlaces([userTarget.reference]);
            this.state.setTargetedPlaces(currentTurn, [userTarget.reference.id]);

            if (currentTurn === 'comp') {
              this.state.setShipUnderAttack();
            }

            this.state.clearPlayerTarget();

            return false;
          }
        });

        if (result !== false) {
          return false;
        }
      }
    });

    return result;
  }

  /**
   * Изменяет прогресс пользователя.
   * @param {number} shipSize - количество ячеек, которые занимает корабль на игровом поле боя.
   */
  updateProgress = (shipSize) => {
    const element = document.getElementById(`ship-progress-${shipSize}`);

    element.innerText = parseInt(element.innerText, 10) + 1;
  };

  /**
   * Изменяет статистику ходов для игрока совершившего ход.
   */
  updateStepsSummary = () => {
    const element = document.getElementById(`${this.state.getCurrentTurn()}-total-steps`);

    element.innerText = parseInt(element.innerText, 10) + 1;
  };
}

export default Step;
