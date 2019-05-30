'use strict';

import State from './State.js';
import Helper from './Helper.js';
import Step from './Step.js';
import Initialization from './Initialization.js';

window.onload = initialize;
window.gl = {
  fun: {
    clickOnBattleField,
    initialize,
    makeStep,
  },
};

/**
 * В случае если ход за пользователем и выбранная ячейка не была атакована ранее,
 * то информация о ячейке сохраняется в хранилище, а сама я ячейка помечается цветом на игровом поле боя.
 * @param {Object} event
 */
function clickOnBattleField(event) {
  const { target } = event;
  const state = new State;
  const helper = new Helper;
  const currentTurn = state.getCurrentTurn();

  if (
    target.childNodes.length === 0
    &&
    !state.getStepIsExecuting()
    &&
    !state.placeWasTargeted(currentTurn, target.id)
  ) {
    helper.setPlayerTarget(target);
  }
}

/**
 * Создание игровых полей, размещение кораблей игроков, инициализация переменных.
 */
function initialize() {
  const state = new State;
  const initialization = new Initialization;
  const userNameElement = document.getElementById('user-name');
  const battleField1 = document.getElementById('battle-field-1');

  userNameElement.addEventListener('blur', storeUserName);
  battleField1.addEventListener('click', window.gl.fun.clickOnBattleField);

  state.create();

  if (state.localEnvironment()) {
    console.clear();
  }

  if (userNameElement.value !== '') {
    state.storeUserName(userNameElement.value);
  }

  initialization.battleField();
}

/**
 * После осуществления следующих проверок:
 * пользователь указал имя в соответствующем поле,
 * пользователь выбрал ячейку для атаки,
 * происходит запуск методов отвечающих за реализацию хода игрока.
 * @return {boolean}
 */
async function makeStep() {
  const state = new State;

  if (state.getStepIsExecuting()) {
    return false;
  }

  const helper = new Helper;

  if (!helper.verifyUserName()) {
    alert('Перед тем как начать игру, пожалуйста введите ваше имя в соответствующем поле в верхнем левом углу экрана.');
    return false;
  }

  if (state.getPlayerTarget().reference === null) {
    alert('Перед тем как совершить ход, пожалуйста выберите ячейку для атаки.');
    return false;
  }

  if (state.getCurrentStep() === 1) {
    helper.disableInput('user-name');
    helper.manageButton('disable', 'rearrange-navy');
  }

  const step = new Step;

  state.setStepIsExecuting(true);
  await step.implementStep();
  state.setStepIsExecuting(false);
}

/**
 * При нажатии enter или потере фокуса полем для ввода имени пользователя,
 * сохраняет в хранилище введенное имя.
 * @param {Object} event
 */
function storeUserName(event) {
  const state = new State;
  const helper = new Helper;
  let nameHasBeenChanged = false;

  if (event.target.value === '') {
    if (helper.verifyUserName()) {
      nameHasBeenChanged = true;
    }
  } else {
    nameHasBeenChanged = true;
  }

  if (nameHasBeenChanged) {
    state.storeUserName(event.target.value);
    helper.showCurrentPlayer();
  }
}
